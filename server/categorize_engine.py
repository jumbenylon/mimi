def categorize_tx(desc, amt):
    d = str(desc).upper()
    
    # 1. CEO RULE: Loan Logic
    if "LOLC" in d or "LOAN" in d or "LIQUIDATION" in d:
        return "Debt Repayment"
        
    # 2. General Categorization
    if amt > 0: return "Income"
    if "UBER" in d or "BOLT" in d: return "Transport"
    if "AIRTIME" in d or "LUKU" in d or "BUNDLE" in d or "INTERNET" in d: return "Utilities"
    if "FOOD" in d or "KFC" in d or "RESTAURANT" in d or "PIZZA" in d or "GROCERY" in d: return "Food"
    if "GOOGLE" in d or "NETFLIX" in d or "SPOTIFY" in d or "APPLE" in d: return "Subscriptions"
    if "TRANSFER" in d or "TIPS" in d: return "Transfer"
    if "WITHDRAWAL" in d or "ATM" in d: return "Cash Withdrawal"
    
    return "General"
