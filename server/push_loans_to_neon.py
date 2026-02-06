import pdfplumber
import re
import os
from datetime import datetime, date
from app.database import SessionLocal, engine
from app.models import Base, Account, Transaction, LoanSchedule
from sqlalchemy import text

# --- CONFIG ---
LOLC_PDF = "DOC-20250404-WA0022..pdf"
ECO_PDF = "Loan Repayment Schedule JUMBE (1).pdf"

def parse_date(x, formats):
    for fmt in formats:
        try:
            return datetime.strptime(x.strip(), fmt).date()
        except:
            continue
    return None

def run_safe_sync():
    print("🚀 STARTING SAFE CLOUD SYNC (NO DATA LOSS)...")
    db = SessionLocal()

    # --- 1. LOLC LOAN ---
    if os.path.exists(LOLC_PDF):
        print("🔹 Processing LOLC Auto Loan...")
        # Get/Create Account
        lolc = db.query(Account).filter(Account.name == "LOLC Auto Loan").first()
        if not lolc:
            lolc = Account(name="LOLC Auto Loan", type="LOAN", balance=-21450000.0)
            db.add(lolc)
            db.commit()
        
        # Clear ONLY this loan's schedule to avoid duplicates
        db.execute(text(f"DELETE FROM loan_schedule WHERE account_id = {lolc.id}"))
        
        # Import PDF
        with pdfplumber.open(LOLC_PDF) as pdf:
            text_data = pdf.pages[0].extract_text().split('\n')
            for line in text_data:
                match = re.search(r'\d{2}-[A-Za-z]{3}-\d{4}', line)
                if match:
                    parts = [p.replace(',', '') for p in line.split() if p.replace(',', '').replace('.', '').isdigit()]
                    if len(parts) >= 4:
                        db.add(LoanSchedule(
                            account_id=lolc.id, installment_no=int(parts[0]), 
                            due_date=parse_date(match.group(), ["%d-%b-%Y"]),
                            repayment_amount=float(parts[1]), principal_component=float(parts[2]),
                            interest_component=float(parts[3]), balance_after=float(parts[4]), status="PENDING"
                        ))
        print("   -> LOLC Schedule Synced.")

    # --- 2. ECOBANK LOAN ---
    if os.path.exists(ECO_PDF):
        print("🔹 Processing Ecobank Loan...")
        # Get/Create Account
        eco = db.query(Account).filter(Account.name == "Ecobank Personal Loan").first()
        if not eco:
            eco = Account(name="Ecobank Personal Loan", type="LOAN", balance=-34500000.0)
            db.add(eco)
            db.commit()

        # Clear ONLY this loan's schedule
        db.execute(text(f"DELETE FROM loan_schedule WHERE account_id = {eco.id}"))

        # Import PDF
        with pdfplumber.open(ECO_PDF) as pdf:
            count = 0
            for page in pdf.pages:
                for line in page.extract_text().split('\n'):
                    match = re.search(r'\d{2}/[A-Za-z]{3}/\d{2,4}', line)
                    if match:
                        parts = [p.replace(',', '') for p in line.split() if p.replace(',', '').replace('.', '').isdigit()]
                        floats = [float(f) for f in parts]
                        # Heuristics for Ecobank format
                        repay = next((f for f in floats if 1200000 < f < 1300000), 0)
                        bal = next((f for f in floats if f > 5000000), 0)
                        
                        if repay > 0:
                            count += 1
                            d = parse_date(match.group(), ["%d/%b/%Y", "%d/%b/%y"])
                            db.add(LoanSchedule(
                                account_id=eco.id, installment_no=count, due_date=d,
                                repayment_amount=repay, principal_component=0, interest_component=0, 
                                balance_after=bal, status="PENDING"
                            ))
        print("   -> Ecobank Schedule Synced.")
    
    db.commit()

    # --- 3. INTELLIGENT LINKING & BACKFILL ---
    print("🔹 Linking Payments...")
    
    # A. Match Existing Real Transactions
    schedules = db.query(LoanSchedule).filter(LoanSchedule.status == "PENDING").all()
    for sch in schedules:
        margin = 2000 # +/- 2000 TZS tolerance
        tx = db.query(Transaction).filter(
            Transaction.amount < 0,
            Transaction.amount <= -(sch.repayment_amount - margin),
            Transaction.amount >= -(sch.repayment_amount + margin),
            Transaction.category != "Debt Repayment" # Only grab uncategorized ones
        ).first()
        
        if tx:
            tx.category = "Debt Repayment"
            sch.status = "PAID"
            print(f"   -> Linked Real Payment: {sch.repayment_amount:,.0f} on {tx.date}")

    # B. Backfill Missing History (Up to Jan 2026)
    cutoff = date(2026, 2, 1)
    
    # Funding source (just grab the first bank)
    bank = db.query(Account).filter(Account.type == "BANK").first()
    bank_id = bank.id if bank else None

    past_due = db.query(LoanSchedule).filter(LoanSchedule.due_date < cutoff, LoanSchedule.status == "PENDING").all()
    for item in past_due:
        item.status = "PAID"
        # Create ghost transaction to correct the balance sheet
        db.add(Transaction(
            date=item.due_date, 
            description=f"Loan Repayment (Historic) - Inst #{item.installment_no}", 
            amount=-item.repayment_amount, 
            category="Debt Repayment", 
            account_id=bank_id
        ))
        print(f"   -> Backfilled History: {item.due_date} ({item.repayment_amount:,.0f})")

    db.commit()
    print("✨ SYNC COMPLETE. Your data is live on Neon.")
    db.close()

if __name__ == "__main__":
    run_safe_sync()
