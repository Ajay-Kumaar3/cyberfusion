from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from models import Account, Transaction, LoginEvent, Alert
from ws_manager import manager
from datetime import datetime
import asyncio
import random
import string

router = APIRouter(prefix="/simulate", tags=["simulate"])

def random_id(prefix="SIM", length=6):
    return f"{prefix}-{''.join(random.choices(string.ascii_uppercase + string.digits, k=length))}"

async def run_attack_simulation():
    # We create a fresh session inside the async task
    from database import SessionLocal
    db = SessionLocal()
    
    sim_account_id = f"ACC-{random.randint(1000, 9999)}"
    print(f"[SIM] Starting attack sequence for {sim_account_id}")
    
    try:
        # ── T+0s: Pre-create the account to avoid FK violations ──
        print(f"[SIM] T+0s: Creating candidate account {sim_account_id}")
        sim_account = Account(
            account_id=sim_account_id,
            name=f"Simulated User {sim_account_id}",
            email=f"sim_{sim_account_id.lower()}@example.com",
            phone="+91-98765-43210",
            location="Mumbai, India",
            status="Normal",
            risk_level="Low",
            cyber_score=15,
            txn_score=10,
            final_score=12,
            created_at=datetime.utcnow()
        )
        db.add(sim_account)
        db.commit()

        # ── T+0s: Phishing event fires ──
        print("[SIM] T+0s: Spear phishing alert")
        phishing_alert = Alert(
            account_id=sim_account_id,
            severity="CRITICAL",
            description=f"Spear phishing link clicked — credentials at risk for {sim_account_id}",
            status="Open",
            cyber_score=95,
            txn_score=20,
            final_score=85,
            created_at=datetime.utcnow()
        )
        db.add(phishing_alert)
        db.commit()
        db.refresh(phishing_alert)

        await manager.broadcast({
            "event": "NEW_ALERT",
            "type": "PHISHING_DETECTED",
            "severity": "CRITICAL",
            "account_id": sim_account_id,
            "description": phishing_alert.description,
            "timestamp": datetime.utcnow().isoformat(),
            "simulation": True
        })

        # ── T+15s: Login anomaly ──
        await asyncio.sleep(15)
        print("[SIM] T+15s: Login anomaly")
        
        login = LoginEvent(
            account_id=sim_account_id,
            ip_address=f"{random.randint(100,200)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}",
            country=random.choice(["RU", "CN", "UA", "NG"]),
            vpn_detected=True,
            cyber_risk_score=92,
            event_type="login",
            location="Remote Access",
            timestamp=datetime.utcnow()
        )
        db.add(login)
        db.commit()

        await manager.broadcast({
            "event": "LOGIN_ANOMALY",
            "type": "ACCOUNT_TAKEOVER",
            "severity": "CRITICAL",
            "account_id": sim_account_id,
            "description": f"Login from {login.country} via VPN — session hijack suspected",
            "ip": login.ip_address,
            "country": login.country,
            "timestamp": datetime.utcnow().isoformat(),
            "simulation": True
        })

        # ── T+30s: Account Compromise ──
        await asyncio.sleep(15)
        print("[SIM] T+30s: Marking account as COMPROMISED")

        db.query(Account).filter(Account.account_id == sim_account_id).update({
            "status": "Compromised",
            "risk_level": "Critical",
            "cyber_score": 91,
            "final_score": 78
        })
        db.commit()

        await manager.broadcast({
            "event": "ACCOUNT_COMPROMISED",
            "type": "ACCOUNT_TAKEOVER",
            "severity": "CRITICAL",
            "account_id": sim_account_id,
            "description": f"Account {sim_account_id} marked COMPROMISED — mule recruitment likely",
            "timestamp": datetime.utcnow().isoformat(),
            "simulation": True
        })

        # ── T+60s: Suspicious Transaction ──
        await asyncio.sleep(30)
        print("[SIM] T+60s: Suspicious Transaction")

        amount = random.randint(5000, 49999)
        txn = Transaction(
            txn_id=random_id("TXN"),
            from_account=sim_account_id,
            to_account="EXT-WALLET-0X8F",
            amount=amount,
            receiver_name=random.choice([
                "Crypto Exchange Alpha",
                "Wire Transfer → HK",
                "Unknown Wallet 0x8f2a",
                "Offshore Account Ltd"
            ]),
            status="FLAGGED",
            created_at=datetime.utcnow()
        )
        db.add(txn)
        db.commit()

        await manager.broadcast({
            "event": "SUSPICIOUS_TRANSACTION",
            "type": "SUSPICIOUS_TXN",
            "severity": "CRITICAL",
            "account_id": sim_account_id,
            "description": f"₹{amount:,} flagged transfer from {sim_account_id} → {txn.receiver_name}",
            "amount": amount,
            "receiver": txn.receiver_name,
            "txn_id": txn.txn_id,
            "timestamp": datetime.utcnow().isoformat(),
            "simulation": True
        })

        # ── T+90s: Cleanup/End ──
        await asyncio.sleep(30)
        print("[SIM] T+90s: Sequence Finished")

        await manager.broadcast({
            "event": "KILL_CHAIN_UPDATE",
            "description": "New attack path detected — kill chain graph updated",
            "account_id": sim_account_id,
            "timestamp": datetime.utcnow().isoformat(),
            "simulation": True,
            "action": "REFRESH_GRAPH"
        })

        await manager.broadcast({
            "event": "SIMULATION_COMPLETE",
            "account_id": sim_account_id,
            "summary": f"Attack simulation complete. {sim_account_id} fully compromised.",
            "timestamp": datetime.utcnow().isoformat(),
            "simulation": True
        })

    except Exception as e:
        print(f"[SIM] Fatal Error: {str(e)}")
        await manager.broadcast({
            "event": "SIMULATION_ERROR",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        })
    finally:
        db.close()

@router.post("/attack")
async def simulate_attack(
    background_tasks: BackgroundTasks
):
    print("[SIM] API: Triggering background task")
    background_tasks.add_task(run_attack_simulation)
    return {
        "status": "simulation_started",
        "message": "Attack simulation initiated."
    }
