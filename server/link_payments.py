from app.database import SessionLocal
from app.models import Transaction, LoanSchedule
from sqlalchemy import or_

def link_payments():
    print("🔗 LINKING PAYMENTS TO SCHEDULE...")
    db = SessionLocal()
    
    # 1. Get unique amounts from the schedule
    # (Usually 1.7M and 1.6M)
    amounts = db.query(LoanSchedule.repayment_amount).distinct().all()
    target_amounts = [a[0] for a in amounts]
    
    print(f"   -> Looking for transactions matching: {[f'{x:,.0f}' for x in target_amounts]}")
    
    count = 0
    found_total = 0
    
    # 2. Search Transactions
    for amt in target_amounts:
        # Define a small margin of error (e.g. +/- 100 shillings) just in case
        margin = 1000
        
        # Find DEBIT transactions (money leaving) that match the amount
        matches = db.query(Transaction).filter(
            Transaction.amount < 0, # Expenses are negative
            Transaction.amount <= -(amt - margin),
            Transaction.amount >= -(amt + margin)
        ).all()
        
        for tx in matches:
            if tx.category != "Debt Repayment":
                print(f"   MATCH FOUND: {tx.date} | {tx.description} | {abs(tx.amount):,.0f}")
                tx.category = "Debt Repayment"
                count += 1
                found_total += abs(tx.amount)
    
    db.commit()
    
    if count > 0:
        print(f"✅ SUCCESS: Linked {count} transactions totaling {found_total:,.0f} TZS.")
    else:
        print("⚠️  No matching payments found. (Are your bank CSVs up to date?)")
    
    db.close()

if __name__ == "__main__":
    link_payments()
