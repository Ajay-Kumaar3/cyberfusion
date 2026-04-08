from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ── Account ──────────────────────────────────────────────────────────────────
class AccountOut(BaseModel):
    account_id: str
    name: str
    email: str
    phone: Optional[str]
    location: Optional[str]
    avg_monthly_transaction: float
    cyber_score: int
    txn_score: int
    graph_score: int
    final_score: int
    risk_level: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Login Event ───────────────────────────────────────────────────────────────
class LoginEventCreate(BaseModel):
    account_id: str
    ip_address: str
    device_id: Optional[str] = None
    event_type: str = "login"
    location: str = ""
    country: str = "IN"
    new_device: bool = False
    new_city: bool = False
    new_ip: bool = False
    vpn_detected: bool = False
    failed_logins: int = 0
    password_changed: bool = False


class LoginEventOut(BaseModel):
    event_id: int
    account_id: str
    ip_address: str
    device_id: Optional[str]
    event_type: str
    location: str
    country: str
    new_device: bool
    new_city: bool
    new_ip: bool
    vpn_detected: bool
    failed_logins: int
    password_changed: bool
    cyber_risk_score: int
    timestamp: datetime

    class Config:
        from_attributes = True


# ── Transaction ───────────────────────────────────────────────────────────────
class TransactionCreate(BaseModel):
    from_account: str
    to_account: str
    amount: float
    category: str = "Transfer"
    receiver_name: str = ""
    new_receiver: bool = False
    time_flag: bool = False
    rapid_transfer: bool = False


class TransactionOut(BaseModel):
    txn_id: str
    from_account: str
    to_account: str
    amount: float
    category: str
    receiver_name: str
    new_receiver: bool
    time_flag: bool
    rapid_transfer: bool
    cyber_score: int
    txn_score: int
    graph_score: int
    final_score: int
    status: str
    flags: str
    ai_explanation: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Alert ─────────────────────────────────────────────────────────────────────
class AlertOut(BaseModel):
    alert_id: int
    account_id: str
    txn_id: Optional[str]
    severity: str
    description: str
    cyber_score: int
    txn_score: int
    final_score: int
    status: str
    ai_explanation: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class AlertStatusUpdate(BaseModel):
    status: str   # "Open" | "Under Review" | "Resolved"


# ── AI Explain ────────────────────────────────────────────────────────────────
class ExplainRequest(BaseModel):
    account_id: str
    txn_id: Optional[str] = None

# ── Dashboard ─────────────────────────────────────────────────────────────────
class DashboardSummary(BaseModel):
    total_accounts: int
    high_risk_accounts: int
    active_alerts: int
    transactions_flagged: int
    transactions_blocked: int
    avg_risk_score: float

class DashboardStats(BaseModel):
    active_threats: int
    mule_accounts_flagged: int
    txns_under_review_amount: float
    recovery_window_seconds: int
