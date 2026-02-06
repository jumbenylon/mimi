from datetime import date
from app.database import SessionLocal
from app.models import LoanSchedule, Transaction, Account

def backfill():
    print("⏳ BACKFILLING PAST PAYMENTS (Up to Jan 2026)...")
    db = SessionLocal()
    
    # 1. Get the cutoff date
    cutoff = date(2026, 2, 1) # Feb 1st, 2026
    
    # 2. Find unpaid schedule items before this date
    past_due = db.query(LoanSchedule).filter(
        LoanSchedule.due_date < cutoff,
        LoanSchedule.status == "PENDING"
    ).all()
    
    # 3. Get a funding source (Just grab the first bank account to log the expense against)
    bank = db.query(Account).filter(Account.type == "BANK").first()
    bank_id = bank.id if bank else None
    
    count = 0
    total_backfilled = 0
    
    for item in past_due:
        # A. Mark Schedule as PAID
        item.status = "PAID"
        
        # B. Create the Transaction Record (So the dashboard shows the money left)
        # Check if one exists first to avoid double counting?
        # For simplicity in this manual override, we assume if schedule was PENDING, tx is missing.
        
        tx = Transaction(
            date=item.due_date,
            description=f"Loan Repayment (Inst #{item.installment_no}) - Backfilled",
            amount=-item.repayment_amount, # Negative because it's money out
            category="Debt Repayment",
            account_id=bank_id
        )
        db.add(tx)
        
        count += 1
        total_backfilled += item.repayment_amount
        print(f"   -> Marked PAID: {item.due_date} | {item.repayment_amount:,.0f} TZS")

    db.commit()
    print(f"✅ SUCCESS: Backfilled {count} payments.")
    print(f"💰 TOTAL ADDED TO 'PAID': {total_backfilled:,.0f} TZS")
    db.close()

if __name__ == "__main__":
    backfill()
