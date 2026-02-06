def categorize_transaction(description, amount):
    desc = description.upper()
    
    # 1. Income
    if "BURN MANUFACTURING" in desc or "SALARY" in desc:
        return "Income"
    
    # 2. Specific Loan Recognition
    if "LOLC" in desc:
        return "Repayment: LOLC"
    
    if "LOAN CONTRACT" in desc or "R77" in desc:
        return "Repayment: Contract"

    # 3. Expenses
    if "PUMA" in desc or "TOTAL" in desc or "ORYX" in desc:
        return "Transport"
    if "SPOTIFY" in desc or "NETFLIX" in desc or "APPLE" in desc:
        return "Lifestyle"
    if "GOOGLE" in desc or "AWS" in desc or "CONTABO" in desc:
        return "Business"
        
    return "Uncategorized"
