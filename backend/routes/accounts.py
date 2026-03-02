from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Account, LoginEvent, Transaction, Alert
from schemas import AccountOut
from typing import List

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("/", response_model=List[AccountOut])
def get_all_accounts(
    skip: int = 0,
    limit: int = 100,
    risk_level: str = None,
    db: Session = Depends(get_db)
):
    q = db.query(Account)
    if risk_level:
        q = q.filter(Account.risk_level == risk_level)
    return q.order_by(Account.final_score.desc()).offset(skip).limit(limit).all()


@router.get("/{account_id}")
def get_account(account_id: str, db: Session = Depends(get_db)):
    acc = db.query(Account).filter(Account.account_id == account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")

    logins = (
        db.query(LoginEvent)
        .filter(LoginEvent.account_id == account_id)
        .order_by(LoginEvent.timestamp.desc())
        .limit(10)
        .all()
    )
    txns = (
        db.query(Transaction)
        .filter(Transaction.from_account == account_id)
        .order_by(Transaction.created_at.desc())
        .limit(10)
        .all()
    )
    alerts = (
        db.query(Alert)
        .filter(Alert.account_id == account_id)
        .order_by(Alert.created_at.desc())
        .all()
    )

    return {
        "account": AccountOut.model_validate(acc),
        "login_events": [
            {
                "event_id": e.event_id,
                "ip_address": e.ip_address,
                "location": e.location,
                "event_type": e.event_type,
                "new_device": e.new_device,
                "new_city": e.new_city,
                "vpn_detected": e.vpn_detected,
                "failed_logins": e.failed_logins,
                "password_changed": e.password_changed,
                "cyber_risk_score": e.cyber_risk_score,
                "timestamp": e.timestamp,
            }
            for e in logins
        ],
        "transactions": [
            {
                "txn_id": t.txn_id,
                "to_account": t.to_account,
                "receiver_name": t.receiver_name,
                "amount": t.amount,
                "status": t.status,
                "final_score": t.final_score,
                "flags": t.flags,
                "created_at": t.created_at,
            }
            for t in txns
        ],
        "alerts": [
            {
                "alert_id": a.alert_id,
                "severity": a.severity,
                "description": a.description,
                "status": a.status,
                "created_at": a.created_at,
            }
            for a in alerts
        ],
    }
