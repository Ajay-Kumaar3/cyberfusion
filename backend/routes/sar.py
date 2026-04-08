from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Account, Transaction, LoginEvent, Alert
import google.generativeai as genai
import os
from datetime import datetime
import random
import string
from config import settings

router = APIRouter(prefix="/sar", tags=["sar"])

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel("gemini-1.5-flash")

async def call_gemini(prompt: str) -> str:
    if not settings.gemini_api_key:
        return "AI generation unavailable: API key not configured."
    try:
        # Use simple synchronous call since we're in an async endpoint anyway
        # but for better hygiene we could wrap in run_in_executor if needed.
        # However, for this demo, direct call is fine.
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini Error: {str(e)}")
        return f"AI generation failed: {str(e)}"

@router.post("/generate")
async def generate_sar(
    payload: dict,  # { "account_id": "ACC-4821" }
    db: Session = Depends(get_db)
):
    account_id = payload.get("account_id")
    
    # Fetch all correlated data
    account = db.query(Account).filter(
        Account.account_id == account_id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    transactions = db.query(Transaction).filter(
        Transaction.from_account == account_id,
        Transaction.status.in_(['FLAGGED', 'SUSPICIOUS', 'REVIEW', 'BLOCKED'])
    ).order_by(Transaction.created_at.desc()).limit(10).all()

    login_events = db.query(LoginEvent).filter(
        LoginEvent.account_id == account_id
    ).order_by(LoginEvent.timestamp.desc()).limit(10).all()

    alerts = db.query(Alert).filter(
        Alert.account_id == account_id
    ).order_by(Alert.created_at.desc()).limit(10).all()

    total_amount = sum(t.amount for t in transactions)
    
    # Build context for Gemini
    context = f"""
Account: {account.account_id}
Name: {account.name}
Risk Score: {account.final_score}/100
Status: {account.status}
Cyber Score: {account.cyber_score}/100
Transaction Score: {account.txn_score}/100

Flagged Transactions ({len(transactions)}):
{chr(10).join([f"- ₹{t.amount} to {t.receiver_name} at {t.created_at} [{t.status}]" for t in transactions])}

Login Anomalies ({len(login_events)}):
{chr(10).join([f"- IP {l.ip_address} ({l.country}) VPN={l.vpn_detected} risk={l.cyber_risk_score}" for l in login_events])}

Active Alerts ({len(alerts)}):
{chr(10).join([f"- [{a.severity}] {a.description}" for a in alerts])}

Total Suspicious Amount: ₹{total_amount:,.2f}
"""

    # Generate all narrative sections via Gemini
    section2_prompt = f"""You are an AML compliance officer writing a SAR for RBI FIU-IND.
Based on this account data, write Section 2 (Suspicious Activity Description) in 3 concise paragraphs.
Be formal, factual, and regulatory-grade. Use precise financial crime terminology.
Account data: {context}"""

    section3_prompt = f"""Based on this account's cyber attack indicators, write Section 3 (Cyber Attribution) 
for a SAR filing. Describe the attack vector, phishing method, and how the account was compromised.
Mention the kill chain progression. Be concise — 2 paragraphs maximum.
Account data: {context}"""

    section5_prompt = f"""As an AML compliance officer, write Section 5 (Recommended Action) 
for this SAR filing. Include: immediate actions (freeze/monitor), regulatory notifications required,
and investigation steps. 3-4 bullet points. Be specific and actionable.
Account data: {context}"""

    # Call Gemini for each section
    section2 = await call_gemini(section2_prompt)
    section3 = await call_gemini(section3_prompt)
    section5 = await call_gemini(section5_prompt)

    # Generate report reference number
    ref_num = f"SAR-{datetime.now().year}-CF-{''.join(random.choices(string.digits, k=4))}"

    return {
        "report_reference": ref_num,
        "filing_institution": "CyberFusion Demo Bank",
        "date_of_filing": datetime.now().strftime("%Y-%m-%d"),
        "generated_at": datetime.utcnow().isoformat(),
        "section1": {
            "account_holder": account.name,
            "account_number": account.account_id,
            "risk_classification": account.status,
            "mule_confidence": int(account.final_score),
            "cyber_score": int(account.cyber_score),
            "txn_score": int(account.txn_score)
        },
        "section2_narrative": section2,
        "section3": {
            "kill_chain_origin": "Dark Web Forum",
            "attack_vector": "Spear Phishing (Kit v4.2)",
            "compromise_method": "Credential harvesting via fake bank portal",
            "narrative": section3,
            "login_anomalies": [
                {
                    "ip": l.ip_address,
                    "country": l.country,
                    "vpn_used": l.vpn_detected,
                    "risk_score": l.cyber_risk_score,
                    "timestamp": l.timestamp.isoformat()
                }
                for l in login_events[:5]
            ]
        },
        "section4_transactions": [
            {
                "txn_id": t.txn_id,
                "amount": float(t.amount),
                "receiver": t.receiver_name,
                "timestamp": t.created_at.isoformat(),
                "status": t.status,
                "risk_score": getattr(t, 'risk_score', None)
            }
            for t in transactions
        ],
        "section4_total": float(total_amount),
        "section5_recommendation": section5,
        "alerts": [
            {
                "severity": a.severity,
                "description": a.description,
                "timestamp": a.created_at.isoformat()
            }
            for a in alerts[:5]
        ]
    }
