from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Alert, Transaction, Account
from schemas import AlertOut, AlertStatusUpdate
from services.gemini import generate_explanation
from typing import List

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/", response_model=List[AlertOut])
def get_alerts(
    status: str = None,
    severity: str = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    q = db.query(Alert)
    if status:
        q = q.filter(Alert.status == status)
    if severity:
        q = q.filter(Alert.severity == severity)
    return q.order_by(Alert.created_at.desc()).limit(limit).all()


@router.patch("/{alert_id}", response_model=AlertOut)
def update_alert_status(alert_id: int, body: AlertStatusUpdate, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = body.status
    db.commit()
    db.refresh(alert)
    return alert


@router.post("/{alert_id}/explain")
def explain_alert(alert_id: int, db: Session = Depends(get_db)):
    """Generate (or return cached) AI explanation for an alert."""
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    # Return cached if already generated
    if alert.ai_explanation:
        return {"explanation": alert.ai_explanation, "cached": True}

    acc = db.query(Account).filter(Account.account_id == alert.account_id).first()
    txn = None
    txn_details = {}
    if alert.txn_id:
        txn = db.query(Transaction).filter(Transaction.txn_id == alert.txn_id).first()
        if txn:
            txn_details = {
                "amount": txn.amount,
                "receiver": txn.receiver_name or txn.to_account,
                "flags": txn.flags,
            }

    # Gather login signals from account's last login events
    login_signals = []
    if acc:
        from models import LoginEvent
        recent = db.query(LoginEvent).filter(
            LoginEvent.account_id == alert.account_id
        ).order_by(LoginEvent.timestamp.desc()).limit(3).all()
        for e in recent:
            if e.new_device: login_signals.append("New Device Login")
            if e.new_city: login_signals.append("New City")
            if e.vpn_detected: login_signals.append("VPN Detected")
            if e.password_changed: login_signals.append("Password Changed")
            if e.failed_logins >= 3: login_signals.append(f"{e.failed_logins} Failed Logins")

    explanation = generate_explanation(
        account_name=acc.name if acc else alert.account_id,
        account_id=alert.account_id,
        cyber_score=alert.cyber_score,
        txn_score=alert.txn_score,
        final_score=alert.final_score,
        login_signals=login_signals,
        txn_details=txn_details,
    )

    alert.ai_explanation = explanation
    if txn:
        txn.ai_explanation = explanation
    db.commit()

    return {"explanation": explanation, "cached": False}
