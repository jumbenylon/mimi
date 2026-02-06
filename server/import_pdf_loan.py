import pdfplumber
import pandas as pd
import re
from datetime import datetime
from app.database import SessionLocal, engine
from app.models import Base, Account, LoanSchedule
from sqlalchemy import text

# CONFIG
PDF_FILE = "DOC-20250404-WA0022..pdf"
LOAN_NAME = "LOLC Auto Loan"
TOTAL_LOAN = 21450000.0

def parse_date(x):
    try:
        return datetime.strptime(x.strip(), "%d-%b-%Y").date()
    except:
        return None

def run_import():
    print("PAGE 1: INITIALIZING SCHEMA...")
    
    # 1. DROP THE OLD TABLE (The Fix)
    # We use a raw connection to ensure the DROP commits immediately.
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS loan_schedule CASCADE"))
        conn.commit()
        print("   -> Old table dropped.")

    # 2. RECREATE TABLE
    Base.metadata.create_all(bind=engine)
    print("   -> New schema applied.")

    db = SessionLocal()

    try:
        # 3. Ensure Account Exists
        account = db.query(Account).filter(Account.name == LOAN_NAME).first()
        if not account:
            account = Account(name=LOAN_NAME, type="LOAN", balance=-TOTAL_LOAN)
            db.add(account)
            db.commit()
            print(f"   -> Created Account: {LOAN_NAME}")
        else:
            account.balance = -TOTAL_LOAN
            db.commit()
            print(f"   -> Linked to Account: {LOAN_NAME}")

        # 4. Extract Data
        print("PAGE 2: PARSING PDF...")
        with pdfplumber.open(PDF_FILE) as pdf:
            page = pdf.pages[0]
            text_content = page.extract_text()
            
            lines = text_content.split('\n')
            count = 0
            
            for line in lines:
                # Look for date pattern like 01-May-2025
                date_match = re.search(r'\d{2}-[A-Za-z]{3}-\d{4}', line)
                if date_match:
                    date_str = date_match.group()
                    clean_line = line.replace(date_str, '')
                    parts = clean_line.split()
                    
                    # Extract numbers
                    nums = [p.replace(',', '') for p in parts if p.replace(',', '').replace('.', '').isdigit()]
                    
                    if len(nums) >= 4:
                        inst_no = int(nums[0])
                        floats = [float(n) for n in nums[1:]]
                        
                        # Mapping based on your PDF logs:
                        # 1726371 (Repay) | 875521 (Prin) | 850850 (Int) | 20574478 (Bal)
                        repayment = floats[0]
                        principal = floats[1]
                        interest = floats[2]
                        balance = floats[3]
                        
                        sch = LoanSchedule(
                            account_id=account.id,
                            installment_no=inst_no,
                            due_date=parse_date(date_str),
                            repayment_amount=repayment,
                            principal_component=principal,
                            interest_component=interest,
                            balance_after=balance,
                            status="PENDING"
                        )
                        db.add(sch)
                        count += 1
                        print(f"   -> Installment {inst_no}: {date_str} | Int: {interest:,.0f} | Prin: {principal:,.0f}")

        db.commit()
        print(f"✅ SUCCESS: Imported {count} installments into Neon DB.")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_import()
