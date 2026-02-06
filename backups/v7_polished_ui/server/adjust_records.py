from app.database import SessionLocal
from app.models import Account, Transaction
from datetime import date

db = SessionLocal()
print("⚖️  Adjusting Records to match Reality...")

# 1. LOG JANUARY SALARY (Without changing Bank Balance)
ecobank = db.query(Account).filter(Account.name == "Ecobank").first()

if ecobank:
    existing_salary = db.query(Transaction).filter(
        Transaction.description == "Salary (January)",
        Transaction.amount == 5890747.50
    ).first()
    
    if not existing_salary:
        salary_tx = Transaction(
            date=date(2026, 1, 28),
            description="Salary (January)",
            amount=5890747.50,
            category="Income",
            account_id=ecobank.id 
        )
        db.add(salary_tx)
        print(f"   - Added Jan Salary: +5,890,747.50 TZS")
    else:
        print("   - Jan Salary already exists. Skipping.")

# 2. REMOVE PREMATURE LOLC PAYMENT (Feb 2026)
lolc_future = db.query(Transaction).filter(
    Transaction.description.like("%LOLC%"),
    Transaction.date >= date(2026, 2, 1)
).first()

if lolc_future:
    db.delete(lolc_future)
    print(f"   - Removed Unpaid LOLC Installment (Feb 1st)")
else:
    print("   - No future LOLC payment found.")

db.commit()
print("✅ SUCCESS: Records Aligned.")
db.close()
