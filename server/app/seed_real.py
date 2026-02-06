from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base
from .models import Account, LoanInstallment, Transaction
from datetime import datetime

def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("📊 Injecting Full Month Budget Data (Jan 2026)...")

    # 1. ACCOUNTS
    ecobank = Account(name="Ecobank (...1307)", type="BANK", balance=5129727.32)
    lolc_loan = Account(name="LOLC Auto Loan", type="LOAN", balance=-10372161.69) 
    jumbe_loan = Account(name="Contract Loan (R77...)", type="LOAN", balance=-18672149.00)

    db.add_all([ecobank, lolc_loan, jumbe_loan])
    db.commit()

    # 2. SCHEDULES
    db.add(LoanInstallment(account_id=lolc_loan.id, due_date=datetime(2026, 2, 1), amount=1626271.24, is_paid=False))
    db.add(LoanInstallment(account_id=jumbe_loan.id, due_date=datetime(2026, 2, 25), amount=1217527.00, is_paid=False))
    
    # 3. FULL JAN 2026 HISTORY
    txs = [
        # --- INCOME ---
        {"d": "2026-01-30", "t": "Burn Manufacturing Salary", "a": 5890747.50, "c": "Income"},
        
        # --- DEBT REPAYMENT (The Heavy Hitters) ---
        {"d": "2026-01-29", "t": "Loan Liquidation (R77 Contract)", "a": -1217000.00, "c": "Repayment: Contract"},
        {"d": "2026-01-15", "t": "CRDB Transfer (LOLC Manual)", "a": -500000.00, "c": "Repayment: LOLC"},
        {"d": "2026-01-07", "t": "TIPS Outward (LOLC Manual)", "a": -1500000.00, "c": "Repayment: LOLC"},

        # --- TRANSPORT (Fuel & Bolt) ---
        {"d": "2026-01-31", "t": "Bolt EU Transport", "a": -32000.00, "c": "Transport"},
        {"d": "2026-01-27", "t": "Puma Petrol Station", "a": -100000.00, "c": "Transport"},
        {"d": "2026-01-20", "t": "Total Energies Fuel", "a": -120000.00, "c": "Transport"},
        {"d": "2026-01-10", "t": "Oryx Energies", "a": -85000.00, "c": "Transport"},

        # --- UTILITIES & BILLS ---
        {"d": "2026-01-28", "t": "Luku Token (Electricity)", "a": -50000.00, "c": "Utilities"},
        {"d": "2026-01-15", "t": "Dawasco Water", "a": -35000.00, "c": "Utilities"},
        {"d": "2026-01-05", "t": "Airtime Bundle (Vodacom)", "a": -20000.00, "c": "Utilities"},

        # --- LIFESTYLE & SUBSCRIPTIONS ---
        {"d": "2026-02-02", "t": "Google Cloud (Dublin)", "a": -131610.25, "c": "Business"},
        {"d": "2026-02-01", "t": "Apple Bill iTunes", "a": -8900.00, "c": "Lifestyle"},
        {"d": "2026-01-23", "t": "Spotify Subscription", "a": -7500.00, "c": "Lifestyle"},
        {"d": "2026-01-18", "t": "DSTV / Canal+ Sub", "a": -115000.00, "c": "Lifestyle"},
        {"d": "2026-01-14", "t": "KFC Arusha", "a": -45000.00, "c": "Food & Dining"},
        {"d": "2026-01-12", "t": "Shoppers Supermarket", "a": -185000.00, "c": "Groceries"},
    ]
    
    for t in txs:
        db.add(Transaction(
            date=datetime.strptime(t["d"], "%Y-%m-%d"),
            description=t["t"],
            amount=t["a"],
            category=t["c"],
            account_id=ecobank.id
        ))

    db.commit()
    print("✅ BUDGET DATA READY: Income vs Expenses vs Debt.")
    db.close()

if __name__ == "__main__":
    seed()
