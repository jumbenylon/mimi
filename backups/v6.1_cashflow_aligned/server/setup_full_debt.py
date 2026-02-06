from app.database import SessionLocal, engine, Base
from app.models import Account, Transaction
from datetime import datetime, date
from dateutil.relativedelta import relativedelta

db = SessionLocal()

print("🏦  Configuring COMPLETE Debt Portfolio (Ecobank + LOLC)...")

# 1. DELETE OLD LOANS (Clean Slate)
old_loans = db.query(Account).filter(Account.type == "LOAN").all()
for loan in old_loans:
    db.delete(loan)
db.commit()

# 2. CREATE LOANS (The Truth)

# A. ECOBANK (Refinance)
# Balance as of Feb 2026: ~23,097,352
ecobank = Account(name="ECOBANK Loan", type="LOAN", balance=-23097352.83)

# B. LOLC (Auto Loan)
# Balance as of Feb 2026 (Installment 10): 11,178,916
lolc = Account(name="LOLC Auto Loan", type="LOAN", balance=-11178916.11)

db.add(ecobank)
db.add(lolc)
db.commit() 

print("✅ Loans Created.")
print("📝  Logging historical repayments...")

# 3. LOG HISTORY: ECOBANK (Jan 25, 2025 -> Present)
payment_eco = 1217527.24
date_eco = date(2025, 1, 25)
today = date.today()

count_eco = 0
curr = date_eco
while curr <= today:
    tx = Transaction(date=curr, description=f"Ecobank Repayment (#{count_eco+1})", amount=-payment_eco, category="Debt Repayment", account_id=ecobank.id)
    db.add(tx)
    curr += relativedelta(months=1)
    count_eco += 1

# 4. LOG HISTORY: LOLC (May 01, 2025 -> Present)
payment_lolc = 1626271.24
date_lolc = date(2025, 5, 1)

count_lolc = 0
curr = date_lolc
while curr <= today:
    tx = Transaction(date=curr, description=f"LOLC Auto Repayment (#{count_lolc+1})", amount=-payment_lolc, category="Debt Repayment", account_id=lolc.id)
    db.add(tx)
    curr += relativedelta(months=1)
    count_lolc += 1

db.commit()

print(f"✅ HISTORY LOGGED:")
print(f"   - Ecobank: {count_eco} payments.")
print(f"   - LOLC: {count_lolc} payments.")
print(f"   - Total Debt: {(ecobank.balance + lolc.balance):,.2f} TZS")
print("🚀  Restart the server to see the full picture.")

db.close()
