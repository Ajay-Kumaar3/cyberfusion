# ── Cyber Risk Scoring ──────────────────────────────────────────────────────
def compute_cyber_risk(event: dict) -> int:
    """
    Compute a 0-100 cyber risk score from a login event dict.
    Keys: new_device, new_city, new_ip, vpn_detected,
          failed_logins (int), password_changed, country
    """
    score = 0
    if event.get("new_device"):
        score += 25
    if event.get("new_city"):
        score += 20
    if event.get("new_ip"):
        score += 15
    if event.get("vpn_detected"):
        score += 15
    if event.get("password_changed"):
        score += 20
    failed = event.get("failed_logins", 0)
    if failed >= 5:
        score += 20
    elif failed >= 3:
        score += 12
    elif failed >= 1:
        score += 5
    if event.get("country", "IN") != "IN":
        score += 10
    return min(score, 100)
