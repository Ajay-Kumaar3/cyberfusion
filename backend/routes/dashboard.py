from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Account, Alert, Transaction
from schemas import DashboardSummary

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)):
    total_accounts = db.query(Account).count()
    high_risk = db.query(Account).filter(
        Account.risk_level.in_(["High", "Critical"])
    ).count()
    active_alerts = db.query(Alert).filter(
        Alert.status.in_(["Open", "Under Review"])
    ).count()
    flagged_txns = db.query(Transaction).filter(
        Transaction.status.in_(["ON_HOLD", "REVIEW", "BLOCKED"])
    ).count()
    blocked_txns = db.query(Transaction).filter(
        Transaction.status == "BLOCKED"
    ).count()
    avg_score_row = db.query(func.avg(Account.final_score)).scalar()
    avg_score = round(float(avg_score_row or 0), 1)

    return DashboardSummary(
        total_accounts=total_accounts,
        high_risk_accounts=high_risk,
        active_alerts=active_alerts,
        transactions_flagged=flagged_txns,
        transactions_blocked=blocked_txns,
        avg_risk_score=avg_score,
    )
