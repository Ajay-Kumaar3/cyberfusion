from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Account, Alert, Transaction
from schemas import DashboardSummary, DashboardStats
from datetime import datetime

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


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    active_threats = db.query(Alert).filter(
        Alert.status.in_(['Open', 'Under Review'])
    ).count()
    
    mule_accounts = db.query(Account).filter(
        Account.status.in_(['Flagged', 'Compromised', 'Frozen'])
    ).count()
    
    txns_under_review = db.query(
        func.sum(Transaction.amount)
    ).filter(
        Transaction.status.in_(['ON_HOLD', 'REVIEW'])
    ).scalar() or 0
    
    # Recovery window: seconds until 48h after oldest open flagged transaction
    oldest_flagged = db.query(Transaction).filter(
        Transaction.status == 'ON_HOLD'
    ).order_by(Transaction.created_at.asc()).first()
    
    if oldest_flagged:
        elapsed = (datetime.utcnow() - oldest_flagged.created_at).total_seconds()
        recovery_window = max(0, 172800 - elapsed)  # 48 hours in seconds
    else:
        recovery_window = 172800
    
    return {
        "active_threats": active_threats,
        "mule_accounts_flagged": mule_accounts,
        "txns_under_review_amount": float(txns_under_review),
        "recovery_window_seconds": int(recovery_window)
    }
