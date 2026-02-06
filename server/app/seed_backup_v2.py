from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base
from .models import Account, LoanInstallment, Transaction
from datetime import datetime

def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("💎 Injecting Hybrid History (Ecobank + CRDB)...")

    # 1. ACCOUNTS
    # Ecobank Balance remains 5.1M (CRDB payments don't lower Ecobank cash)
    ecobank = Account(name="Ecobank (...1307)", type="BANK", balance=5129727.32)
    
    # LOLC Loan Balance Update:
    # Schedule Balance (Jan): 12.37M
    # Less CRDB Pay (Dec 29): 1.50M
    # Less CRDB Pay (Jan 15): 0.50M
    # New Balance: ~10.37M
    lolc_loan = Account(name="LOLC Auto Loan", type="LOAN", balance=-10372161.69) 
    
    # Contract Loan (Unchanged)
    jumbe_loan = Account(name="Contract Loan (R77...)", type="LOAN", balance=-18672149.00)

    db.add_all([ecobank, lolc_loan, jumbe_loan])
    db.commit()

    # 2. SCHEDULES
    db.add(LoanInstallment(account_id=lolc_loan.id, due_date=datetime(2026, 2, 1), amount=1626271.24, is_paid=False))
    db.add(LoanInstallment(account_id=jumbe_loan.id, due_date=datetime(2026, 2, 25), amount=1217527.00, is_paid=False))
    
    # 3. TRANSACTION HISTORY
    txs = [
        # --- NEW: CRDB PAYMENTS (Manual Add) ---
        {"d": "2026-01-15", "t": "CRDB Transfer (LOLC)", "a": -500000.00, "c": "Repayment: LOLC"},
        {"d": "2025-12-29", "t": "CRDB Transfer (LOLC)", "a": -1500000.00, "c": "Repayment: LOLC"},

        # --- EXISTING ECOBANK HISTORY ---
        {"d": "2026-01-07", "t": "TIPS Outward (LOLC)", "a": -1500000.00, "c": "Repayment: LOLC"},
        {"d": "2025-12-27", "t": "TIPS Outward (LOLC)", "a": -1500000.00, "c": "Repayment: LOLC"},
        {"d": "2025-10-02", "t": "TIPS Outward (LOLC)", "a": -1650000.00, "c": "Repayment: LOLC"},
        {"d": "2025-09-01", "t": "TIPS Outward (LOLC)", "a": -1650000.00, "c": "Repayment: LOLC"},
        {"d": "2025-08-04", "t": "TIPS Outward (LOLC)", "a": -1700000.00, "c": "Repayment: LOLC"},
        {"d": "2025-06-25", "t": "TIPS Outward (LOLC)", "a": -2000000.00, "c": "Repayment: LOLC"},
        {"d": "2025-06-02", "t": "TIPS Outward (LOLC)", "a": -1626271.24, "c": "Repayment: LOLC"},
        
        # --- CONTRACT LOAN ---
        {"d": "2026-01-29", "t": "Loan Liquidation (Jan)", "a": -1217000.00, "c": "Repayment: Contract"},
        {"d": "2025-12-24", "t": "Loan Liquidation (Dec)", "a": -1217527.00, "c": "Repayment: Contract"},
        {"d": "2025-11-27", "t": "Loan Liquidation (Nov)", "a": -1207619.00, "c": "Repayment: Contract"},
        
        # --- LIFESTYLE ---
        {"d": "2026-02-02", "t": "Google Cloud (Dublin)", "a": -131610.25, "c": "Business"},
        {"d": "2026-01-30", "t": "Burn Manufacturing Salary", "a": 5890747.50, "c": "Income"},
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
    print("✅ DATA UPDATED: Added CRDB Payments & Adjusted Balance.")
    db.close()

if __name__ == "__main__":
    seed()
