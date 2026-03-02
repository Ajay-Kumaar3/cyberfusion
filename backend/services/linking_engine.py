# ── Linking Engine — Unified Risk Scoring ────────────────────────────────────
def compute_final_score(cyber: int, txn: int, graph: int = 0) -> int:
    """
    Combine the three component scores using weighted formula:
    final = 0.4 * cyber + 0.4 * txn + 0.2 * graph
    """
    return round(0.4 * cyber + 0.4 * txn + 0.2 * graph)


def get_risk_level(score: int) -> str:
    if score >= 86:
        return "Critical"
    elif score >= 71:
        return "High"
    elif score >= 51:
        return "Medium"
    return "Low"


def get_transaction_action(final_score: int) -> str:
    """
    Determine transaction outcome based on unified risk score.
    Mirrors real banking fraud-hold systems.
    """
    if final_score >= 75:
        return "ON_HOLD"
    elif final_score >= 60:
        return "REVIEW"
    return "APPROVED"


def get_alert_severity(final_score: int) -> str | None:
    if final_score >= 86:
        return "CRITICAL"
    elif final_score >= 71:
        return "HIGH"
    elif final_score >= 55:
        return "MEDIUM"
    return None   # No alert
