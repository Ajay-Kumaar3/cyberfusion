from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Transaction, Account, Alert
from schemas import TransactionCreate, TransactionOut
from services.transaction_risk import compute_transaction_risk
from services.linking_engine import compute_final_score, get_risk_level, get_transaction_action, get_alert_severity
from typing import List
from datetime import datetime
import uuid
import json

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/", response_model=List[TransactionOut])
def get_transactions(
    account_id: str = None,
    status: str = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    q = db.query(Transaction)
    if account_id:
        q = q.filter(Transaction.from_account == account_id)
    if status:
        q = q.filter(Transaction.status == status)
    return q.order_by(Transaction.created_at.desc()).limit(limit).all()


@router.post("/", response_model=TransactionOut)
def create_transaction(payload: TransactionCreate, db: Session = Depends(get_db)):
    acc = db.query(Account).filter(Account.account_id == payload.from_account).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")

    # Score the transaction
    txn_score = compute_transaction_risk(payload.model_dump(), avg_monthly=acc.avg_monthly_transaction)
    cyber_score = acc.cyber_score
    graph_score = acc.graph_score
    final_score = compute_final_score(cyber_score, txn_score, graph_score)
    status = get_transaction_action(final_score)

    # Build flag list
    flags = _build_flags(payload, acc.avg_monthly_transaction)

    txn = Transaction(
        txn_id=f"TXN-{uuid.uuid4().hex[:8].upper()}",
        **payload.model_dump(),
        cyber_score=cyber_score,
        txn_score=txn_score,
        graph_score=graph_score,
        final_score=final_score,
        status=status,
        flags=json.dumps(flags),
        created_at=datetime.utcnow(),
    )
    db.add(txn)

    # Update account's txn score
    acc.txn_score = max(acc.txn_score, txn_score)
    acc.final_score = compute_final_score(acc.cyber_score, acc.txn_score, acc.graph_score)
    acc.risk_level = get_risk_level(acc.final_score)
    if acc.final_score >= 71:
        acc.status = "Flagged"
    if acc.final_score >= 86:
        acc.status = "Compromised"

    # Create alert if needed
    severity = get_alert_severity(final_score)
    if severity:
        alert = Alert(
            account_id=payload.from_account,
            txn_id=txn.txn_id,
            severity=severity,
            description=f"{payload.receiver_name or payload.to_account}: ₹{payload.amount:,.0f} — {', '.join(flags) or 'Suspicious activity'}",
            cyber_score=cyber_score,
            txn_score=txn_score,
            final_score=final_score,
            status="Open",
            created_at=datetime.utcnow(),
        )
        db.add(alert)

    db.commit()
    db.refresh(txn)
    return txn


def _build_flags(payload: TransactionCreate, avg: float) -> list[str]:
    flags = []
    ratio = payload.amount / max(avg, 1)
    if ratio >= 10: flags.append(f"{ratio:.0f}x Avg Amount")
    elif ratio >= 5: flags.append(f"{ratio:.0f}x Avg Amount")
    elif ratio >= 3: flags.append(f"{ratio:.0f}x Avg Amount")
    if payload.new_receiver: flags.append("New Receiver")
    if payload.time_flag: flags.append("Unusual Hour")
    if payload.rapid_transfer: flags.append("Rapid Transfer")
    if payload.category in ("Crypto", "Wire Transfer"): flags.append(f"{payload.category} Transfer")
    return flags
