import os
import google.generativeai as genai
from config import settings

genai.configure(api_key=settings.gemini_api_key)
_model = genai.GenerativeModel("gemini-2.5-flash")


def generate_explanation(account_name: str, account_id: str,
                         cyber_score: int, txn_score: int, final_score: int,
                         login_signals: list[str], txn_details: dict) -> str:
    """
    Call Gemini API to generate an investigator-friendly fraud explanation.
    Returns plain text summary.
    """
    if not settings.gemini_api_key:
        return (
            f"[AI Explanation Unavailable — no Gemini API key configured]\n"
            f"Account {account_id} has Cyber Risk: {cyber_score}, "
            f"Transaction Risk: {txn_score}, Combined Score: {final_score}."
        )

    signals_str = ", ".join(login_signals) if login_signals else "None detected"
    prompt = f"""
You are a senior financial fraud analyst. A banking transaction has been automatically flagged.
Provide a concise, professional 2-3 sentence investigation summary for the fraud team.

Account: {account_name} ({account_id})
Cyber Risk Score: {cyber_score}/100
Transaction Risk Score: {txn_score}/100  
Combined Risk Score: {final_score}/100
Login Anomaly Signals: {signals_str}
Transaction: ₹{txn_details.get('amount', 0):,.0f} to {txn_details.get('receiver', 'Unknown')}
Transaction Flags: {txn_details.get('flags', 'None')}

Write only the summary. Be direct. Recommend an action (freeze, review, or block).
""".strip()

    try:
        response = _model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return (
            f"AI explanation failed: {str(e)}. "
            f"Manual review required for account {account_id} "
            f"(Cyber: {cyber_score}, TXN: {txn_score}, Final: {final_score})."
        )
