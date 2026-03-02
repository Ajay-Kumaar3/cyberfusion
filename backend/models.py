from database import Base
from sqlalchemy import (
    Column, String, Integer, Float, Boolean,
    DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from datetime import datetime


class Account(Base):
    __tablename__ = "accounts"

    account_id   = Column(String, primary_key=True, index=True)
    name         = Column(String, nullable=False)
    email        = Column(String, unique=True, nullable=False)
    phone        = Column(String)
    location     = Column(String)
    avg_monthly_transaction = Column(Float, default=5000.0)
    cyber_score  = Column(Integer, default=0)
    txn_score    = Column(Integer, default=0)
    graph_score  = Column(Integer, default=0)
    final_score  = Column(Integer, default=0)
    risk_level   = Column(String, default="Low")   # Low/Medium/High/Critical
    status       = Column(String, default="Normal") # Normal/Flagged/Compromised/Frozen
    created_at   = Column(DateTime, default=datetime.utcnow)

    login_events = relationship("LoginEvent", back_populates="account")
    transactions_from = relationship("Transaction", back_populates="from_acct",
                                     foreign_keys="Transaction.from_account")
    devices      = relationship("Device", back_populates="account")
    alerts       = relationship("Alert", back_populates="account")


class Device(Base):
    __tablename__ = "devices"

    device_id    = Column(String, primary_key=True, index=True)
    account_id   = Column(String, ForeignKey("accounts.account_id"))
    fingerprint  = Column(String)
    device_name  = Column(String)
    trusted      = Column(Boolean, default=False)
    first_seen   = Column(DateTime, default=datetime.utcnow)

    account      = relationship("Account", back_populates="devices")


class LoginEvent(Base):
    __tablename__ = "login_events"

    event_id        = Column(Integer, primary_key=True, autoincrement=True)
    account_id      = Column(String, ForeignKey("accounts.account_id"))
    ip_address      = Column(String)
    device_id       = Column(String, ForeignKey("devices.device_id"), nullable=True)
    event_type      = Column(String)   # login / failed_login / password_reset / otp_fail
    location        = Column(String)
    country         = Column(String, default="IN")
    new_device      = Column(Boolean, default=False)
    new_city        = Column(Boolean, default=False)
    new_ip          = Column(Boolean, default=False)
    vpn_detected    = Column(Boolean, default=False)
    failed_logins   = Column(Integer, default=0)
    password_changed = Column(Boolean, default=False)
    cyber_risk_score = Column(Integer, default=0)
    timestamp       = Column(DateTime, default=datetime.utcnow)

    account         = relationship("Account", back_populates="login_events")


class Transaction(Base):
    __tablename__ = "transactions"

    txn_id          = Column(String, primary_key=True, index=True)
    from_account    = Column(String, ForeignKey("accounts.account_id"))
    to_account      = Column(String)           # can point to external or internal
    amount          = Column(Float)
    category        = Column(String, default="Transfer")
    receiver_name   = Column(String)
    new_receiver    = Column(Boolean, default=False)
    time_flag       = Column(Boolean, default=False)  # unusual hour
    rapid_transfer  = Column(Boolean, default=False)  # < 5 min after last txn
    cyber_score     = Column(Integer, default=0)
    txn_score       = Column(Integer, default=0)
    graph_score     = Column(Integer, default=0)
    final_score     = Column(Integer, default=0)
    status          = Column(String, default="PENDING")  # PENDING/APPROVED/ON_HOLD/REVIEW/BLOCKED
    flags           = Column(Text, default="")           # JSON string of flag labels
    ai_explanation  = Column(Text, nullable=True)
    created_at      = Column(DateTime, default=datetime.utcnow)

    from_acct       = relationship("Account", back_populates="transactions_from",
                                   foreign_keys=[from_account])


class Alert(Base):
    __tablename__ = "alerts"

    alert_id        = Column(Integer, primary_key=True, autoincrement=True)
    account_id      = Column(String, ForeignKey("accounts.account_id"))
    txn_id          = Column(String, ForeignKey("transactions.txn_id"), nullable=True)
    severity        = Column(String)           # CRITICAL / HIGH / MEDIUM / LOW
    description     = Column(Text)
    cyber_score     = Column(Integer, default=0)
    txn_score       = Column(Integer, default=0)
    final_score     = Column(Integer, default=0)
    status          = Column(String, default="Open")  # Open / Under Review / Resolved
    ai_explanation  = Column(Text, nullable=True)
    created_at      = Column(DateTime, default=datetime.utcnow)

    account         = relationship("Account", back_populates="alerts")
