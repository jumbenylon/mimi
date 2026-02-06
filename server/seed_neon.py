import pandas as pd
import os
from app.database import SessionLocal, engine
from app.models import Base, Account, Transaction, Investment
from sqlalchemy import text

# --- CONFIG ---
FILES = {
    "ECOBANK": "ecobank.csv",
    "CRDB Bank": "crdb.csv",
    "Selcom Pay": "selcom.csv"
}
ASSET_FILE = "assets.csv"

# --- HELPERS ---
def clean_float(x):
    if pd.isna(x) or str(x).strip() == "" or str(x).lower() == "nan": return 0.0
    clean = str(x).replace(',', '').replace('"', '').strip()
    try: return float(clean)
    except: return 0.0

def categorize(desc, amt):
    d = str(desc).upper()
    if "LOLC" in d or "LOAN" in d or "LIQUIDATION" in d: return "Debt Repayment"
    if amt > 0: return "Income"
    if "UBER" in d or "BOLT" in d: return "Transport"
    if "AIRTIME" in d or "LUKU" in d or "BUNDLE" in d: return "Utilities"
    if "FOOD" in d or "KFC" in d or "GROCERY" in d: return "Food"
    if "GOOGLE" in d or "NETFLIX" in d: return "Subscriptions"
    if "TRANSFER" in d: return "Transfer"
    return "General"

def run_golden_seed():
    print("🚀 INITIATING GOLDEN SEED TO NEON DB...")
    
    # 1. CONNECT & WIPE (The "Fresh Start")
    Base.metadata.create_all(bind=engine) # Create tables if missing
    db = SessionLocal()
    
    # WARNING: This wipes existing data to ensure a clean seed.
    # Verify we are connected to Postgres
    conn_info = str(engine.url)
    if "sqlite" in conn_info:
        print("⚠️  CAUTION: Still using SQLite. Did you update database.py?")
    else:
        print("✅ Connected to Neon PostgreSQL.")

    print("🧹 Cleaning old records...")
    db.execute(text("TRUNCATE TABLE transactions CASCADE;"))
    db.execute(text("TRUNCATE TABLE investments CASCADE;"))
    db.execute(text("TRUNCATE TABLE accounts CASCADE;"))
    db.commit()

    # 2. SEED ACCOUNTS
    acc_map = {}
    for name in FILES.keys():
        acc = Account(name=name, type="BANK" if "Bank" in name else "WALLET", balance=0.0)
        db.add(acc)
        db.commit() # Commit to get ID
        acc_map[name] = acc.id
    
    # Also add Loan Accounts manually if needed, or let them be created dynamically
    # For now, we focus on the CSV sources.

    # 3. SEED TRANSACTIONS (Ecobank)
    print("🔹 Processing Ecobank...")
    try:
        df = pd.read_csv(FILES["ECOBANK"], skiprows=1, header=None)
        df['DateObj'] = pd.to_datetime(df[0], format="%d-%b-%Y", errors='coerce')
        for _, row in df.iterrows():
            if pd.isna(row['DateObj']) or row['DateObj'].year < 2026: continue
            amt = clean_float(row[4]) - clean_float(row[3]) # Credit - Debit
            if amt != 0:
                db.add(Transaction(
                    date=row['DateObj'], description=str(row[1])[:100], amount=amt,
                    category=categorize(row[1], amt), account_id=acc_map["ECOBANK"]
                ))
        # Update Balance
        last_bal = clean_float(df.iloc[-1][5]) if not df.empty else 0
        db.query(Account).get(acc_map["ECOBANK"]).balance = last_bal
    except Exception as e: print(f"❌ Ecobank Error: {e}")

    # 4. SEED TRANSACTIONS (CRDB)
    print("🔹 Processing CRDB...")
    try:
        df = pd.read_csv(FILES["CRDB Bank"])
        df['DateObj'] = pd.to_datetime(df['TRANS DATE'], format="%d-%b-%Y", errors='coerce')
        for _, row in df.iterrows():
            if pd.isna(row['DateObj']) or row['DateObj'].year < 2026: continue
            amt = clean_float(row['CREDIT']) - clean_float(row['DEBIT'])
            if amt != 0:
                db.add(Transaction(
                    date=row['DateObj'], description=str(row['DETAILS'])[:100], amount=amt,
                    category=categorize(row['DETAILS'], amt), account_id=acc_map["CRDB Bank"]
                ))
        last_bal = clean_float(df.iloc[-1]['BOOK BALANCE']) if not df.empty else 0
        db.query(Account).get(acc_map["CRDB Bank"]).balance = last_bal
    except Exception as e: print(f"❌ CRDB Error: {e}")

    # 5. SEED TRANSACTIONS (Selcom)
    print("🔹 Processing Selcom...")
    try:
        df = pd.read_csv(FILES["Selcom Pay"])
        # Simple Delta Logic for speed
        df = df.sort_values(by='Transaction Date')
        prev = None
        for _, row in df.iterrows():
            curr = clean_float(row['Balance'])
            if prev is not None:
                amt = curr - prev
                if abs(amt) > 0.01:
                    db.add(Transaction(
                        date=pd.to_datetime(str(row['Transaction Date'])[:10], errors='coerce'), 
                        description="Selcom Transaction", amount=amt,
                        category=categorize("Selcom", amt), account_id=acc_map["Selcom Pay"]
                    ))
            prev = curr
        # Balance
        db.query(Account).get(acc_map["Selcom Pay"]).balance = prev if prev else 0
    except Exception as e: print(f"❌ Selcom Error: {e}")

    # 6. SEED ASSETS (Stocks, Vehicles, Land)
    print("🔹 Processing Assets...")
    try:
        if os.path.exists(ASSET_FILE):
            df = pd.read_csv(ASSET_FILE)
            for _, row in df.iterrows():
                # Flexible Column Reading
                cat = str(row['category'])
                name = str(row['name'])
                qty = clean_float(row['quantity'])
                buy = clean_float(row['buy_price'])
                curr = row['current_price']
                curr = clean_float(curr) if not pd.isna(curr) else buy
                val = qty * curr
                logo = str(row['meta_data']) if 'meta_data' in row else ""

                db.add(Investment(
                    category=cat, name=name, quantity=qty, 
                    buy_price=buy, current_price=curr, value=val, logo=logo
                ))
    except Exception as e: print(f"❌ Asset Error: {e}")

    db.commit()
    print("✨ GOLDEN SEED COMPLETE. Your Neon DB is now live.")
    db.close()

if __name__ == "__main__":
    run_golden_seed()
