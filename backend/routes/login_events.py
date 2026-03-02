from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import LoginEvent, Account
from schemas import LoginEventCreate, LoginEventOut
from services.cyber_risk import compute_cyber_risk
from typing import List
from datetime import datetime

router = APIRouter(prefix="/api/logins", tags=["logins"])


@router.get("/", response_model=List[LoginEventOut])
def get_logins(
    account_id: str = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    q = db.query(LoginEvent)
    if account_id:
        q = q.filter(LoginEvent.account_id == account_id)
    return q.order_by(LoginEvent.timestamp.desc()).limit(limit).all()


@router.post("/", response_model=LoginEventOut)
def create_login_event(payload: LoginEventCreate, db: Session = Depends(get_db)):
    score = compute_cyber_risk(payload.model_dump())
    event = LoginEvent(
        **payload.model_dump(),
        cyber_risk_score=score,
        timestamp=datetime.utcnow(),
    )
    db.add(event)

    # Update account's cyber score (take max of last 3 events)
    acc = db.query(Account).filter(Account.account_id == payload.account_id).first()
    if acc:
        acc.cyber_score = max(acc.cyber_score, score)
        acc.final_score = round(0.4 * acc.cyber_score + 0.4 * acc.txn_score + 0.2 * acc.graph_score)
        acc.risk_level = _risk_level(acc.final_score)

    db.commit()
    db.refresh(event)
    return event


def _risk_level(score: int) -> str:
    if score >= 86: return "Critical"
    if score >= 71: return "High"
    if score >= 51: return "Medium"
    return "Low"
