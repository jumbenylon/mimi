from app.database import SessionLocal, engine, Base
from app.models import Account, Transaction
from datetime import datetime, date
from dateutil.relativedelta import relativedelta

db = SessionLocal()
print("🧹 Cleaning up duplicate debt transactions...")

# 1. DELETE ALL OLD DEBT TRANSACTIONS (Force Clean)
deleted_count = db.query(Transaction).filter(Transaction.category == "Debt Repayment").delete(synchronize_session=False)
db.commit()
print(f"   - Removed {deleted_count} duplicate/old records.")

# 2. GET LOAN ACCOUNTS
ecobank = db.query(Account).filter(Account.name.like("%Ecobank%")).first()
lolc = db.query(Account).filter(Account.name.like("%LOLC%")).first()

if not ecobank or not lolc:
    print("❌ Error: Loans not found. Please run setup_full_debt.py first.")
    exit()

# 3. REGENERATE CLEAN HISTORY

# A. Ecobank (Jan 25, 2025 -> Present)
payment_eco = 1217527.24
date_eco = date(2025, 1, 25)
today = date.today()
count = 0
curr = date_eco

while curr <= today:
    tx = Transaction(
        date=curr, 
        description=f"Ecobank Repayment (#{count+1})", 
        amount=-payment_eco, 
        category="Debt Repayment", 
        account_id=ecobank.id
    )
    db.add(tx)
    curr += relativedelta(months=1)
    count += 1

# B. LOLC (May 01, 2025 -> Present)
payment_lolc = 1626271.24
date_lolc = date(2025, 5, 1)
curr = date_lolc
count_lolc = 0

while curr <= today:
    tx = Transaction(
        date=curr, 
        description=f"LOLC Auto Repayment (#{count_lolc+1})", 
        amount=-payment_lolc, 
        category="Debt Repayment", 
        account_id=lolc.id
    )
    db.add(tx)
    curr += relativedelta(months=1)
    count_lolc += 1

db.commit()
print(f"✅ SUCCESS: History Regenerated.")
print(f"   - Ecobank: {count} clean records.")
print(f"   - LOLC: {count_lolc} clean records.")
print("🚀 Restart the server to see the fixed budget.")
db.close()
