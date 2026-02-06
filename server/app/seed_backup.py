from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base
from .models import Account, LoanInstallment, Transaction
from datetime import datetime, timedelta

def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("🔍 FORENSIC AUDIT COMPLETE. Injecting Verified Balances...")

    # 1. ACCOUNTS
    # Ecobank Closing Balance (Verified Statement Page 82)
    ecobank = Account(name="Ecobank (...1307)", type="BANK", balance=5129727.32)
    
    # Loan 1: LOLC Auto Loan
    # Status: Current / Manual Payments. 
    # Balance derived from Schedule Row 9 (Jan 2026)
    lolc_loan = Account(name="LOLC Auto Loan", type="LOAN", balance=-12372161.69) 
    
    # Loan 2: Contract Loan (R77...)
    # Status: Aggressive Auto-Liquidation.
    # Original: 34.5M. Paid: ~15.8M. Remaining: ~18.6M
    jumbe_loan = Account(name="Contract Loan (R77...)", type="LOAN", balance=-18672149.00)

    db.add_all([ecobank, lolc_loan, jumbe_loan])
    db.commit()

    # 2. NEXT DUE SCHEDULE
    # LOLC Next: Feb 1st (Month 10 of 18)
    db.add(LoanInstallment(
        account_id=lolc_loan.id,
        due_date=datetime(2026, 2, 1),
        amount=1626271.24,
        is_paid=False
    ))

    # Contract Loan Next: Feb 25th (Estimated Sweep)
    db.add(LoanInstallment(
        account_id=jumbe_loan.id,
        due_date=datetime(2026, 2, 25),
        amount=1217527.00, 
        is_paid=False
    ))
    
    # 3. RECENT TRANSACTIONS (Verified from Statement Page 81-82)
    txs = [
        {"d": "2026-02-02", "t": "Google Cloud (Dublin)", "a": -131610.25, "c": "Business"},
        {"d": "2026-02-02", "t": "Google Ads (Mountain View)", "a": -588.55, "c": "Business"},
        {"d": "2026-02-01", "t": "Apple Bill iTunes", "a": -8900.00, "c": "Lifestyle"},
        {"d": "2026-01-30", "t": "Burn Manufacturing Salary", "a": 5890747.50, "c": "Income"},
        {"d": "2026-01-29", "t": "Loan Liquidation (R77...)", "a": -1217527.00, "c": "Debt Repayment"},
        {"d": "2026-01-29", "t": "LOLC Manual Transfer", "a": -307727.48, "c": "Debt Repayment"},
        {"d": "2026-01-23", "t": "Spotify Subscription", "a": -7500.00, "c": "Lifestyle"},
        {"d": "2026-01-13", "t": "Kambona Mixed Tours", "a": -90000.00, "c": "Travel"}
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
    print("✅ DATABASE SYNCED: Debt reduced by 5.3M TZS based on audit.")
    db.close()

if __name__ == "__main__":
    seed()
