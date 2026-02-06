import pandas as pd
import os
import sys
from datetime import datetime
from app.database import SessionLocal
from app.models import Transaction, Account
from sqlalchemy import text

# --- CONFIGURATION ---
FILENAMES = {
    "ECOBANK": "ecobank.csv",
    "CRDB Bank": "crdb.csv",
    "Selcom Pay": "selcom.csv"
}

def find_file(name):
    # Check current directory
    if os.path.exists(name): return name
    # Check parent directory
    parent = os.path.join("..", name)
    if os.path.exists(parent): return parent
    # Check server directory (if running from root)
    server_dir = os.path.join("server", name)
    if os.path.exists(server_dir): return server_dir
    return None

def parse_float(x):
    if isinstance(x, str):
        clean = x.replace(',', '').replace('"', '').strip()
        if clean == '' or clean == '-': return 0.0
        try: return float(clean)
        except: return 0.0
    return float(x or 0)

def categorize(desc, amt):
    d = str(desc).upper()
    if "LOAN" in d: return "Debt Repayment"
    if "UBER" in d or "BOLT" in d: return "Transport"
    if "AIRTIME" in d or "LUKU" in d or "BUNDLE" in d: return "Utilities"
    if "FOOD" in d or "KFC" in d or "RESTAURANT" in d or "PIZZA" in d: return "Food"
    if "GOOGLE" in d or "NETFLIX" in d or "SPOTIFY" in d: return "Subscriptions"
    if "TRANSFER" in d: return "Transfer"
    if amt > 0: return "Income"
    return "General"

def run_import():
    db = SessionLocal()
    print("🚀 STARTING SMART IMPORT...")

    # 1. CLEAN SLATE (Wipe old transactions)
    db.execute(text("DELETE FROM transactions"))
    db.commit()
    print("🧹 Old records wiped.")

    # 2. ENSURE ACCOUNTS
    acc_map = {}
    for name in FILENAMES.keys():
        acc = db.query(Account).filter(Account.name == name).first()
        if not acc:
            acc = Account(name=name, type="BANK" if "Bank" in name else "WALLET", balance=0.0)
            db.add(acc)
            db.commit()
        acc_map[name] = acc.id
    
    # Ensure Mpesa/Mixx exist too
    for w in ["Mpesa 0753930000", "Mixx by Yas 0714021078"]:
        if not db.query(Account).filter(Account.name == w).first():
            db.add(Account(name=w, type="WALLET", balance=0.0))
            db.commit()

    total_tx = 0

    # --- PROCESS FILES ---
    for acc_name, fname in FILENAMES.items():
        print(f"📂 Looking for {fname}...")
        file_path = find_file(fname)
        
        if not file_path:
            print(f"❌ ERROR: Could not find '{fname}'. Please move it to the 'mimi' folder.")
            continue
            
        print(f"   ✅ Found at: {file_path}")
        
        try:
            # Detect file type based on headers or name
            if "ecobank" in fname.lower():
                # Ecobank: Skip 1 row, no header
                df = pd.read_csv(file_path, skiprows=1, header=None)
                # Col 0=Date, 1=Desc, 3=Debit, 4=Credit, 5=Bal
                for _, row in df.iterrows():
                    try:
                        date_obj = datetime.strptime(str(row[0]), "%d-%b-%Y").date()
                        if date_obj.year < 2026: continue
                        desc = str(row[1])
                        debit = parse_float(row[3])
                        credit = parse_float(row[4])
                        amt = credit - debit
                        if amt == 0: continue
                        
                        db.add(Transaction(
                            date=date_obj, description=desc[:60], amount=amt,
                            category=categorize(desc, amt), account_id=acc_map[acc_name]
                        ))
                        total_tx += 1
                        # Update Balance (Last row will win)
                        db.query(Account).get(acc_map[acc_name]).balance = parse_float(row[5])
                    except: continue

            elif "crdb" in fname.lower():
                # CRDB: Headers exist
                df = pd.read_csv(file_path)
                for _, row in df.iterrows():
                    try:
                        date_obj = datetime.strptime(str(row['TRANS DATE']), "%d-%b-%Y").date()
                        if date_obj.year < 2026: continue
                        desc = str(row['DETAILS'])
                        debit = parse_float(row['DEBIT'])
                        credit = parse_float(row['CREDIT'])
                        amt = credit - debit
                        if amt == 0: continue
                        
                        db.add(Transaction(
                            date=date_obj, description=desc[:60], amount=amt,
                            category=categorize(desc, amt), account_id=acc_map[acc_name]
                        ))
                        total_tx += 1
                        db.query(Account).get(acc_map[acc_name]).balance = parse_float(row['BOOK BALANCE'])
                    except: continue

            elif "selcom" in fname.lower():
                # Selcom: Tricky format
                df = pd.read_csv(file_path)
                # Assuming Col '-4-' is amount. Since Selcom is mostly spending, we assume debit unless 'Deposit' in name?
                # Actually, let's assume standard wallet logic: Balance decreases = Debit.
                # Since we don't have explicit Debit/Credit cols, we'll try to infer or just log as Expenses for now.
                # Using the "-4-" column as raw amount.
                for _, row in df.iterrows():
                    try:
                        raw_date = str(row['Transaction Date'])[:10]
                        date_obj = datetime.strptime(raw_date, "%Y-%m-%d").date()
                        amt_raw = parse_float(row['-4-'])
                        bal = parse_float(row['Balance'])
                        
                        # Logic: Selcom is usually spending.
                        final_amt = -amt_raw 
                        
                        db.add(Transaction(
                            date=date_obj, description="Selcom Transaction", amount=final_amt,
                            category="General", account_id=acc_map[acc_name]
                        ))
                        total_tx += 1
                        db.query(Account).get(acc_map[acc_name]).balance = bal
                    except: continue
                    
            db.commit()
            print(f"   ✅ Processed {fname}")
            
        except Exception as e:
            print(f"   ❌ Error processing {fname}: {e}")

    print(f"✨ DONE. Imported {total_tx} transactions.")
    db.close()

if __name__ == "__main__":
    run_import()
