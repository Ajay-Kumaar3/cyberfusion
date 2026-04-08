from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Account, Transaction, Alert
from typing import List, Dict, Any

router = APIRouter(prefix="/killchain", tags=["killchain"])

@router.get("/compute")
def compute_kill_chain(db: Session = Depends(get_db)):
    # Base Nodes
    nodes = [
        {"id": "origin", "type": "ATTACK_ORIGIN", "label": "Dark Web Forum", "risk": 100},
        {"id": "phish1", "type": "PHISHING", "label": "Phishing Kit v4.2", "risk": 90},
        {"id": "exit1", "type": "EXIT_POINT", "label": "Crypto Exchange A", "risk": 95},
        {"id": "exit2", "type": "EXIT_POINT", "label": "Wire Transfer → HK", "risk": 98}
    ]
    
    edges = [
        {"source": "origin", "target": "phish1", "type": "DEPLOYS"}
    ]

    # Fetch compromised accounts (including simulated ones)
    accounts = db.query(Account).filter(Account.status.in_(["Compromised", "Flagged"])).limit(5).all()
    for acc in accounts:
        nodes.append({
            "id": acc.account_id,
            "type": "COMPROMISED_ACCOUNT",
            "label": f"{acc.account_id} ({acc.name[:10]}...)",
            "risk": acc.cyber_score
        })
        edges.append({"source": "phish1", "target": acc.account_id, "type": "COMPROMISES"})

        # Fetch transactions for these accounts
        txns = db.query(Transaction).filter(Transaction.from_account == acc.account_id).limit(2).all()
        for t in txns:
            nodes.append({
                "id": t.txn_id,
                "type": "TRANSACTION",
                "label": f"₹{t.amount:,}",
                "risk": t.final_score or 70
            })
            edges.append({"source": acc.account_id, "target": t.txn_id, "type": "TRANSFERS"})
            
            # Link to exit points
            target_exit = "exit1" if t.amount < 10000 else "exit2"
            edges.append({"source": t.txn_id, "target": target_exit, "type": "LAUNDERS_VIA"})

    return {"nodes": nodes, "edges": edges}
