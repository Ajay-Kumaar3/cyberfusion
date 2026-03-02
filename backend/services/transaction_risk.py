# ── Transaction Risk Scoring ─────────────────────────────────────────────────
def compute_transaction_risk(txn: dict, avg_monthly: float = 5000.0) -> int:
    """
    Compute a 0-100 transaction risk score.
    Keys: amount, new_receiver, time_flag (unusual hour),
          rapid_transfer (bool), category
    """
    score = 0
    amount = txn.get("amount", 0)
    ratio = amount / max(avg_monthly, 1)

    if ratio >= 10:
        score += 40
    elif ratio >= 5:
        score += 30
    elif ratio >= 3:
        score += 20
    elif ratio >= 2:
        score += 10

    if txn.get("new_receiver"):
        score += 25

    if txn.get("time_flag"):      # transaction at unusual hour (11PM–6AM)
        score += 15

    if txn.get("rapid_transfer"): # < 5 min after last transaction
        score += 20

    category = txn.get("category", "")
    if category in ("Crypto", "Wire Transfer"):
        score += 10

    return min(score, 100)
