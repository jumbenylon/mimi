from datetime import datetime
from app.database import SessionLocal
from app.models import Transaction, Account

def run_logic():
    db = SessionLocal()
    print("🧠 Applying 'Salary Date' Logic...")

    # 1. Get Accounts
    eco = db.query(Account).filter(Account.name == "ECOBANK").first()
    if not eco:
        print("❌ Ecobank account not found!")
        return

    # 2. CLEAR OLD TRANSACTIONS to avoid duplicates
    # We are re-writing the history with the correct logic
    # (In a real app we might update, but here we replace for accuracy)
    db.query(Transaction).filter(Transaction.account_id == eco.id).delete()
    db.commit()

    # 3. LOGIC DATA (Extracted from your CSV)
    # Income Date: Jan 29, 2026
    
    records = [
        # --- BEFORE SALARY (Paid by Old Money) ---
        # We log this as "Adjustment" so it doesn't look like you "Overspent" your new salary
        {
            "date": "2026-01-28", 
            "desc": "Jan Spending (Pre-Salary)", 
            "amt": -0.00,  # Your CSV actually showed almost 0 spend *before* the 29th!
            "cat": "Adjustment",
            "acc": eco
        },

        # --- THE SALARY EVENT (Jan 29) ---
        {
            "date": "2026-01-29", 
            "desc": "January Salary Income", 
            "amt": 5890747.50, 
            "cat": "Income",
            "acc": eco
        },

        # --- AFTER SALARY (Paid by New Money) ---
        # This is the ~3.7M deduction that happened ON/AFTER Jan 29
        {
            "date": "2026-01-29", 
            "desc": "Jan Expenses (Loans/Transfers)", 
            "amt": -3714765.59, 
            "cat": "Expense",
            "acc": eco
        },

        # --- FEBRUARY (Paid by Jan Carryover) ---
        {
            "date": "2026-02-14", 
            "desc": "February Expenses (To Date)", 
            "amt": -148566.00, 
            "cat": "Expense",
            "acc": eco
        }
    ]

    # 4. Insert Records
    for r in records:
        tx = Transaction(
            date=datetime.strptime(r['date'], "%Y-%m-%d").date(),
            description=r['desc'],
            amount=r['amt'],
            category=r['cat'],
            account_id=r['acc'].id
        )
        db.add(tx)
    
    # 5. Update Account Balance Automatically
    # Balance = Sum of all transactions + Opening (0)
    total_balance = sum(r['amt'] for r in records)
    eco.balance = total_balance
    
    db.commit()
    print(f"✅ Logic Applied. New Ecobank Balance: {total_balance:,.2f}")
    db.close()

if __name__ == "__main__":
    run_logic()
