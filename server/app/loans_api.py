from fastapi import APIRouter
from .database import SessionLocal
from .models import Transaction, Account, LoanSchedule

router = APIRouter()

@router.get("/api/loans")
async def get_loans():
    db = SessionLocal()
    try:
        # 1. Fetch Loan Accounts
        loan_accounts = db.query(Account).filter(Account.type == "LOAN").all()
        
        loans_data = []
        grand_total_principal = 0

        for loan in loan_accounts:
            # Check schedule count
            sched_count = db.query(LoanSchedule).filter(LoanSchedule.account_id == loan.id).count()
            
            # Determine Principal
            principal = abs(loan.balance)
            if "LOLC" in loan.name and principal < 20000000: principal = 21450000.0
            if "Ecobank" in loan.name and principal < 30000000: principal = 34500000.0
            
            loans_data.append({
                "id": loan.id,
                "name": loan.name,
                "principal": principal,
                "schedule_count": sched_count
            })
            grand_total_principal += principal

        # 2. Get Repayments
        repayments = db.query(Transaction).filter(
            Transaction.category == "Debt Repayment"
        ).order_by(Transaction.date.desc()).all()
        
        total_paid_real = sum(abs(t.amount) for t in repayments)
        grand_total_remaining = grand_total_principal - total_paid_real

        return {
            "summary": {
                "principal": grand_total_principal,
                "paid": total_paid_real,
                "remaining": grand_total_remaining,
                "progress": (total_paid_real / grand_total_principal * 100) if grand_total_principal > 0 else 0
            },
            "loans": loans_data,
            "transactions": repayments
        }
    finally:
        db.close()
