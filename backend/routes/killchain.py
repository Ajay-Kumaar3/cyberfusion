from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Account, Transaction, LoginEvent, Alert
import hashlib
from datetime import datetime
from typing import List, Dict, Any

router = APIRouter(prefix="/killchain", tags=["killchain"])

@router.get("/compute")
async def compute_kill_chain(db: Session = Depends(get_db)):
    nodes = []
    edges = []
    node_ids = set()  # track already-added nodes

    def add_node(node_id, node_type, label, risk, metadata={}):
        if node_id not in node_ids:
            nodes.append({
                "id": node_id,
                "type": node_type,
                "label": label,
                "risk": risk,
                **metadata
            })
            node_ids.add(node_id)

    # ── 1. Always add attack origin + phishing nodes (static anchors) ──
    add_node("origin", "ATTACK_ORIGIN", "Dark Web Forum", 100)
    add_node("phish1", "PHISHING", "Phishing Kit v4.2", 90)
    edges.append({"source": "origin", "target": "phish1", 
                  "type": "DEPLOYS"})

    # ── 2. Compromised accounts — accounts with cyber_score > 70 ──
    compromised = db.query(Account).filter(
        Account.cyber_score > 70
    ).order_by(Account.cyber_score.desc()).limit(4).all()

    for acc in compromised:
        node_id = f"acc_{acc.account_id}"
        add_node(
            node_id,
            "COMPROMISED_ACCOUNT",
            f"{acc.account_id} ({acc.name.split()[0]} {acc.name.split()[-1][0]}.)" if " " in acc.name else acc.account_id,
            int(acc.cyber_score),
            {"status": acc.status}
        )
        edges.append({
            "source": "phish1",
            "target": node_id,
            "type": "COMPROMISES"
        })

    # ── 3. Mule accounts — accounts with status FLAGGED/COMPROMISED 
    #        AND lower cyber_score (they are recruited, not directly attacked) ──
    mules = db.query(Account).filter(
        Account.status.in_(['FLAGGED', 'UNDER_REVIEW', 'Compromised']),
        Account.final_score > 60,
        Account.cyber_score < 70
    ).order_by(Account.final_score.desc()).limit(6).all()

    # Connect mules to compromised accounts (round-robin assignment)
    for i, mule in enumerate(mules):
        mule_node_id = f"mule_{mule.account_id}"
        add_node(
            mule_node_id,
            "MULE_ACCOUNT",
            mule.account_id,
            int(mule.final_score),
            {"mule_confidence": int(mule.final_score)}
        )
        # Connect to a compromised account
        if compromised:
            source_acc = compromised[i % len(compromised)]
            edges.append({
                "source": f"acc_{source_acc.account_id}",
                "target": mule_node_id,
                "type": "RECRUITS"
            })

    # ── 4. Transactions — flagged transactions from mule accounts ──
    flagged_txns = db.query(Transaction).filter(
        Transaction.status.in_(['FLAGGED', 'SUSPICIOUS', 'REVIEW'])
    ).order_by(Transaction.amount.desc()).limit(8).all()

    exit_points = {}  # receiver_name -> node_id

    for txn in flagged_txns:
        txn_node_id = f"txn_{txn.txn_id}"
        label = f"₹{int(txn.amount):,}"
        add_node(
            txn_node_id,
            "TRANSACTION",
            label,
            min(100, int((txn.amount / 50000) * 100)),
            {"amount": float(txn.amount), "txn_id": txn.txn_id}
        )

        # Connect transaction to its source mule account if exists
        matching_mule = next(
            (m for m in mules if m.account_id == txn.from_account),
            None
        )
        if matching_mule:
            edges.append({
                "source": f"mule_{matching_mule.account_id}",
                "target": txn_node_id,
                "type": "TRANSFERS"
            })
        elif compromised:
            # Fall back to first compromised account
            edges.append({
                "source": f"acc_{compromised[0].account_id}",
                "target": txn_node_id,
                "type": "TRANSFERS"
            })

        # Create exit point node from receiver name
        receiver = txn.receiver_name or "Unknown Exit"
        if receiver not in exit_points:
            exit_id = f"exit_{hashlib.md5(receiver.encode()).hexdigest()[:8]}"
            
            # Classify exit point type
            if any(k in receiver.lower() for k in 
                   ['crypto', 'exchange', 'wallet', 'bitcoin', 'eth']):
                exit_type = "EXIT_POINT"
                exit_label = f"Crypto: {receiver[:20]}"
            elif any(k in receiver.lower() for k in 
                     ['wire', 'swift', 'international', 'foreign']):
                exit_type = "EXIT_POINT"
                exit_label = f"Wire: {receiver[:20]}"
            else:
                exit_type = "EXIT_POINT"
                exit_label = receiver[:25]
            
            add_node(exit_id, exit_type, exit_label, 95)
            exit_points[receiver] = exit_id

        edges.append({
            "source": txn_node_id,
            "target": exit_points[receiver],
            "type": "LAUNDERS_VIA"
        })

    # ── 5. Login anomaly nodes for accounts with suspicious logins ──
    suspicious_logins = db.query(LoginEvent).filter(
        LoginEvent.cyber_risk_score > 75
    ).order_by(LoginEvent.cyber_risk_score.desc()).limit(3).all()

    for login in suspicious_logins:
        login_node_id = f"login_{login.event_id}"
        label = f"Login: {login.country or 'Unknown'}"
        # Only add if linked to a compromised or mule account
        linked_acc = next(
            (a for a in compromised + mules 
             if a.account_id == login.account_id),
            None
        )
        if linked_acc:
            add_node(
                login_node_id,
                "LOGIN_ANOMALY",
                label,
                int(login.cyber_risk_score),
                {"ip": login.ip_address, "vpn": login.vpn_detected}
            )
            acc_node_id = (
                f"acc_{linked_acc.account_id}" 
                if linked_acc in compromised 
                else f"mule_{linked_acc.account_id}"
            )
            edges.append({
                "source": login_node_id,
                "target": acc_node_id,
                "type": "PRECEDES"
            })

    # ── 6. Compute graph-level statistics ──
    total_exposure = sum(
        t.amount for t in flagged_txns
    )
    
    return {
        "nodes": nodes,
        "edges": edges,
        "stats": {
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "compromised_accounts": len(compromised),
            "mule_accounts": len(mules),
            "flagged_transactions": len(flagged_txns),
            "total_exposure": float(total_exposure),
            "exit_points": len(exit_points)
        },
        "computed_at": datetime.utcnow().isoformat()
    }
