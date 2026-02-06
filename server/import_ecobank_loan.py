import pdfplumber
import re
from datetime import datetime
from app.database import SessionLocal, engine
from app.models import Base, Account, LoanSchedule
from sqlalchemy import text

# CONFIG
PDF_FILE = "Loan Repayment Schedule JUMBE (1).pdf"
LOAN_NAME = "Ecobank Personal Loan"
TOTAL_LOAN = 34500000.0

def parse_date(x):
    # Ecobank Format: 25/Jan/2025
    try:
        return datetime.strptime(x.strip(), "%d/%b/%Y").date()
    except:
        # Try 2-digit year: 25/Feb/27
        try:
            return datetime.strptime(x.strip(), "%d/%b/%y").date()
        except:
            return None

def run_import():
    print("🏦 IMPORTING ECOBANK LOAN...")
    db = SessionLocal()

    try:
        # 1. Create/Update Account
        account = db.query(Account).filter(Account.name == LOAN_NAME).first()
        if not account:
            account = Account(name=LOAN_NAME, type="LOAN", balance=-TOTAL_LOAN)
            db.add(account)
            db.commit()
            print(f"   -> Created Account: {LOAN_NAME}")
        else:
            account.balance = -TOTAL_LOAN
            db.commit()
            print(f"   -> Updated Account: {LOAN_NAME}")

        # 2. Clear Old Schedule for this account only
        db.execute(text(f"DELETE FROM loan_schedule WHERE account_id = {account.id}"))
        db.commit()

        # 3. Parse PDF
        with pdfplumber.open(PDF_FILE) as pdf:
            count = 0
            # Ecobank PDF has multiple pages. We iterate all.
            for page in pdf.pages:
                text_content = page.extract_text()
                lines = text_content.split('\n')
                
                # Logic: Look for lines with dates like "25/Jan/2025" or "25/Feb/27"
                # Ecobank rows often look like:
                # "R77APLL...  25/Jan/2025  1,217,527.24  0  33,887,404.27"
                
                for line in lines:
                    # Regex for Date
                    date_match = re.search(r'\d{2}/[A-Za-z]{3}/\d{2,4}', line)
                    if date_match:
                        date_str = date_match.group()
                        
                        # Clean line
                        clean = line.replace(date_str, '').replace('R77APLL243510005', '')
                        parts = clean.split()
                        nums = [p.replace(',', '') for p in parts if p.replace(',', '').replace('.', '').isdigit()]
                        
                        if len(nums) >= 2:
                            # Heuristic: Find the Repayment Amount (around 1.2M)
                            # and Balance (around 30M+)
                            
                            repayment = 0.0
                            balance = 0.0
                            
                            # Convert all found numbers to floats
                            floats = [float(n) for n in nums]
                            
                            # Repayment is usually ~1.2M
                            for f in floats:
                                if 1200000 < f < 1300000:
                                    repayment = f
                                elif f > 5000000:
                                    balance = f
                            
                            # Infer components if missing (Ecobank sometimes splits Principal/Interest on different lines)
                            # For now, we store the Repayment & Balance. 
                            # If we find Principal/Interest specific lines, we could refine, but total payment is key.
                            
                            if repayment > 0:
                                sch = LoanSchedule(
                                    account_id=account.id,
                                    installment_no=count + 1, # Auto-increment
                                    due_date=parse_date(date_str),
                                    repayment_amount=repayment,
                                    principal_component=0, # Unknown from this simple scrape
                                    interest_component=0,  # Unknown
                                    balance_after=balance,
                                    status="PENDING"
                                )
                                db.add(sch)
                                count += 1
                                print(f"   -> Added Payment: {date_str} | {repayment:,.0f}")

        db.commit()
        print(f"✅ SUCCESS: Imported {count} Ecobank installments.")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_import()
