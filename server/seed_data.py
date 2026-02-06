import pandas as pd
from datetime import datetime
from app.database import SessionLocal, engine
from app.main import Transaction, Account
from sqlalchemy import text

# --- CONFIGURATION ---
TARGETS = {
    "CRDB Bank": 218251.23,           # User Confirmed
    "ECOBANK": 4529727.32,            # User Confirmed
    "Ecobank Loan": -19477157.06,     # Calculated (34.5M - 15M Paid)
    "LOLC Loan": -11178916.11         # Verified from PDF (Feb 2026)
}

FILES = {
    "ECOBANK": "converted.csv",
    # We try the Processed one first, but the script is now smart enough to handle Raw too
    "CRDB": "crdb.xlsx - Processed Transactions.csv" 
}

def clean_desc(desc):
    import re
    if not desc or pd.isna(desc): return "Transaction"
    d = str(desc)
    d = re.sub(r'REFNO:[A-Z0-9]+', '', d)
    d = re.sub(r'POS PURCHASE.*?-', '', d)
    d = re.sub(r'E-COM Purchase', '', d)
    if "LOAN CONTRACT" in d: return "Loan Transaction"
    return d.strip()[:60]

def smart_import(file_path, bank_name, account_id, db):
    print(f"   Analyzing {file_path}...")
    try:
        df = pd.read_csv(file_path)
        # 1. Clean Headers (Remove spaces)
        df.columns = df.columns.str.strip()
        print(f"   - Found Columns: {list(df.columns)}")

        # 2. Map Columns Dynamically
        col_map = {}
        
        # Find Date
        for c in ['Date', 'TRANS DATE', 'Column 1']:
            if c in df.columns:
                col_map['date'] = c
                break
        
        # Find Description
        for c in ['Description', 'DETAILS', 'Column 2']:
            if c in df.columns:
                col_map['desc'] = c
                break
                
        # Find Debit/Credit
        for c in ['Debit', 'DEBIT', 'Column 4']:
            if c in df.columns: col_map['debit'] = c
        for c in ['Credit', 'CREDIT', 'Column 5']:
            if c in df.columns: col_map['credit'] = c

        if 'date' not in col_map:
            print(f"   ⚠️ SKIPPING: Could not find Date column in {file_path}")
            return

        # 3. Iterate & Add
        count = 0
        for _, row in df.iterrows():
            try:
                # Date Parsing
                raw_date = str(row[col_map['date']])
                if raw_date == "OPENING BALANCE" or pd.isna(raw_date): continue
                
                try:
                    dt = pd.to_datetime(raw_date).date()
                except:
                    continue # Skip invalid dates

                # Amount Parsing
                debit = 0.0
                credit = 0.0
                
                if 'debit' in col_map and pd.notnull(row[col_map['debit']]):
                    val = str(row[col_map['debit']]).replace(',', '')
                    if val.replace('.','',1).isdigit(): debit = float(val)
                
                if 'credit' in col_map and pd.notnull(row[col_map['credit']]):
                    val = str(row[col_map['credit']]).replace(',', '')
                    if val.replace('.','',1).isdigit(): credit = float(val)

                amt = credit if credit > 0 else -debit
                if amt == 0: continue

                # Category Logic
                cat = "Income" if amt > 0 else "General"
                desc = clean_desc(row[col_map['desc']])
                
                if "LOAN CONTRACT LIQUIDATION" in str(row[col_map['desc']]).upper():
                    cat = "Debt Repayment"
                if "BOLT" in desc.upper(): cat = "Transport"
                if "LEVY" in desc.upper(): cat = "Fees"

                db.add(Transaction(
                    date=dt, description=desc, amount=amt, category=cat, account_id=account_id
                ))
                count += 1
            except Exception as e:
                continue
        
        print(f"   ✅ Imported {count} transactions for {bank_name}")

    except FileNotFoundError:
        print(f"   ❌ ERROR: File not found: {file_path}")

def run_fix():
    db = SessionLocal()
    print("🚀 STARTING ROBUST REPAIR (V4)...")

    try:
        # 1. WIPE
        with engine.connect() as conn:
            conn.execute(text("DELETE FROM transactions"))
            conn.execute(text("DELETE FROM accounts"))
            conn.commit()
        print("🧹 Database wiped.")

        # 2. SETUP ACCOUNTS
        accounts = {}
        for name, bal in TARGETS.items():
            acc_type = "LOAN" if "Loan" in name else "BANK"
            acc = Account(name=name, type=acc_type, balance=0.0)
            db.add(acc)
            db.commit()
            db.refresh(acc)
            accounts[name] = acc
        
        db.add(Account(name="SELCOM Bank", type="BANK", balance=0.0))
        db.commit()

        # 3. RUN IMPORTS
        smart_import(FILES['ECOBANK'], "ECOBANK", accounts["ECOBANK"].id, db)
        smart_import(FILES['CRDB'], "CRDB Bank", accounts["CRDB Bank"].id, db)

        db.commit()

        # 4. ALIGN BALANCES
        print("⚖️  Aligning Balances...")
        for name, target in TARGETS.items():
            acc = accounts[name]
            result = db.execute(text(f"SELECT SUM(amount) FROM transactions WHERE account_id = {acc.id}"))
            current_sum = result.scalar() or 0
            
            diff = target - current_sum
            
            if abs(diff) > 1: # Only adjust if diff is significant (> 1 TZS)
                desc = "Opening Balance" if diff > 0 else "Adjustment"
                if "Loan" in name: desc = "Principal Balance Carryover"
                
                db.add(Transaction(
                    date=datetime(2023, 12, 31).date(),
                    description=desc, amount=diff, category="Adjustment", account_id=acc.id
                ))
            
            acc.balance = target
        
        db.commit()
        print("✅ DONE. Financials synced.")

    except Exception as e:
        print(f"❌ CRITICAL ERROR: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_fix()
