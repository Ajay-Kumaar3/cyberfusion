"""
seed.py — Generate 200 simulated accounts, login events, transactions and alerts.
Run: python seed.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine
from models import Base, Account, Device, LoginEvent, Transaction, Alert
from services.cyber_risk import compute_cyber_risk
from services.transaction_risk import compute_transaction_risk
from services.linking_engine import compute_final_score, get_risk_level, get_transaction_action, get_alert_severity
from faker import Faker
import random
import uuid
import json
from datetime import datetime, timedelta

fake = Faker("en_IN")
random.seed(42)

# ── Create tables ─────────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Clear existing data (for re-runs)
db.query(Alert).delete()
db.query(Transaction).delete()
db.query(LoginEvent).delete()
db.query(Device).delete()
db.query(Account).delete()
db.commit()
print("✓ Tables cleared")

CITIES = [
    ("Chennai, TN", "IN"), ("Mumbai, MH", "IN"), ("Delhi, DL", "IN"),
    ("Bangalore, KA", "IN"), ("Hyderabad, TS", "IN"), ("Pune, MH", "IN"),
    ("Kolkata, WB", "IN"), ("Ahmedabad, GJ", "IN"),
    ("Amsterdam, NL", "NL"), ("Singapore, SG", "SG"), ("Dubai, AE", "AE"),
]
CATEGORIES = ["Transfer", "Transfer", "Transfer", "Shopping", "Food",
              "Subscription", "Crypto", "Wire Transfer"]

print("Creating 200 accounts ...")
accounts = []
for i in range(200):
    acc_id = f"ACC-{1000 + i}"
    avg_txn = round(random.uniform(2000, 25000), 2)
    acc = Account(
        account_id=acc_id,
        name=fake.name(),
        email=fake.unique.email(),
        phone=fake.phone_number()[:15],
        location=random.choice(CITIES[:8])[0],
        avg_monthly_transaction=avg_txn,
        cyber_score=0,
        txn_score=0,
        graph_score=0,
        final_score=0,
        risk_level="Low",
        status="Normal",
        created_at=datetime.utcnow() - timedelta(days=random.randint(30, 365)),
    )
    db.add(acc)
    accounts.append(acc)

db.commit()
print(f"✓ {len(accounts)} accounts created")

# ── Devices ───────────────────────────────────────────────────────────────────
DEVICE_NAMES = ["iPhone 14", "Samsung Galaxy S23", "MacBook Pro", "Chrome on Windows",
                "Unknown Android", "VPN — Unknown", "iPad Pro", "Pixel 7"]
print("Creating devices ...")
for acc in accounts:
    n = random.randint(1, 3)
    for j in range(n):
        dev = Device(
            device_id=f"DEV-{uuid.uuid4().hex[:8]}",
            account_id=acc.account_id,
            fingerprint=uuid.uuid4().hex,
            device_name=random.choice(DEVICE_NAMES),
            trusted=(j == 0),
        )
        db.add(dev)
db.commit()
print("✓ Devices created")

# ── Login Events ──────────────────────────────────────────────────────────────
print("Creating login events ...")
for acc in accounts:
    n_events = random.randint(1, 5)
    home_city = acc.location
    for _ in range(n_events):
        city, country = random.choice(CITIES)
        new_city = city != home_city
        new_device = random.random() < 0.3
        vpn = country != "IN" or (random.random() < 0.1)
        failed = random.randint(0, 8) if random.random() < 0.25 else 0
        pwd_changed = random.random() < 0.1
        new_ip = new_device or new_city or (random.random() < 0.2)

        ev_data = dict(
            new_device=new_device, new_city=new_city, new_ip=new_ip,
            vpn_detected=vpn, failed_logins=failed,
            password_changed=pwd_changed, country=country,
        )
        score = compute_cyber_risk(ev_data)

        ev = LoginEvent(
            account_id=acc.account_id,
            ip_address=fake.ipv4(),
            event_type="login" if failed == 0 else "failed_login",
            location=city,
            country=country,
            new_device=new_device,
            new_city=new_city,
            new_ip=new_ip,
            vpn_detected=vpn,
            failed_logins=failed,
            password_changed=pwd_changed,
            cyber_risk_score=score,
            timestamp=datetime.utcnow() - timedelta(hours=random.randint(0, 24)),
        )
        db.add(ev)
        acc.cyber_score = max(acc.cyber_score, score)

db.commit()
print("✓ Login events created")

# ── Transactions ──────────────────────────────────────────────────────────────
print("Creating transactions ...")
all_ids = [a.account_id for a in accounts]
txns_created = []

for acc in accounts:
    n_txns = random.randint(1, 6)
    last_txn_time = None
    for _ in range(n_txns):
        to_acc = random.choice([x for x in all_ids if x != acc.account_id])
        amount = round(random.uniform(500, acc.avg_monthly_transaction * 15), 2)
        hour = random.randint(0, 23)
        time_flag = hour < 6 or hour >= 23
        new_recv = random.random() < 0.4
        tx_time = datetime.utcnow() - timedelta(hours=random.randint(0, 12),
                                                 minutes=random.randint(0, 59))
        rapid = last_txn_time and (tx_time - last_txn_time).total_seconds() < 300
        last_txn_time = tx_time
        category = random.choice(CATEGORIES)

        txn_data = dict(
            amount=amount, new_receiver=new_recv,
            time_flag=time_flag, rapid_transfer=bool(rapid),
            category=category,
        )
        t_score = compute_transaction_risk(txn_data, avg_monthly=acc.avg_monthly_transaction)
        c_score = acc.cyber_score
        final = compute_final_score(c_score, t_score, acc.graph_score)
        status = get_transaction_action(final)

        flags = []
        ratio = amount / max(acc.avg_monthly_transaction, 1)
        if ratio >= 3: flags.append(f"{ratio:.0f}x Avg Amount")
        if new_recv: flags.append("New Receiver")
        if time_flag: flags.append("Unusual Hour")
        if rapid: flags.append("Rapid Transfer")
        if category in ("Crypto", "Wire Transfer"): flags.append(f"{category} Transfer")

        txn = Transaction(
            txn_id=f"TXN-{uuid.uuid4().hex[:8].upper()}",
            from_account=acc.account_id,
            to_account=to_acc,
            amount=amount,
            category=category,
            receiver_name=fake.name() if new_recv else fake.name(),
            new_receiver=new_recv,
            time_flag=time_flag,
            rapid_transfer=bool(rapid),
            cyber_score=c_score,
            txn_score=t_score,
            graph_score=acc.graph_score,
            final_score=final,
            status=status,
            flags=json.dumps(flags),
            created_at=tx_time,
        )
        db.add(txn)
        txns_created.append((txn, acc, final, t_score, c_score, flags))
        acc.txn_score = max(acc.txn_score, t_score)

db.commit()
print(f"✓ {len(txns_created)} transactions created")

# ── Update final scores + alerts ──────────────────────────────────────────────
print("Computing final scores and generating alerts ...")
alerts_count = 0
for acc in accounts:
    acc.final_score = compute_final_score(acc.cyber_score, acc.txn_score, acc.graph_score)
    acc.risk_level = get_risk_level(acc.final_score)
    if acc.final_score >= 86:
        acc.status = "Compromised"
    elif acc.final_score >= 71:
        acc.status = "Flagged"

for txn, acc, final, t_score, c_score, flags in txns_created:
    severity = get_alert_severity(final)
    if severity:
        desc = f"₹{txn.amount:,.0f} to {txn.receiver_name} — {', '.join(flags) or 'anomaly detected'}"
        alert = Alert(
            account_id=acc.account_id,
            txn_id=txn.txn_id,
            severity=severity,
            description=desc,
            cyber_score=c_score,
            txn_score=t_score,
            final_score=final,
            status=random.choice(["Open", "Open", "Open", "Under Review", "Resolved"]),
            created_at=txn.created_at,
        )
        db.add(alert)
        alerts_count += 1

db.commit()
print(f"✓ Final scores updated | {alerts_count} alerts generated")
print("\n🎉 Seed complete! Database is ready.")
print(f"   Accounts: 200 | Alerts: {alerts_count} | Transactions: {len(txns_created)}")
db.close()
