from app.database import SessionLocal
from app.models import Account, Transaction
import math

def is_bad(num):
    # Check if number is None, NaN, or Infinite
    if num is None: return True
    try:
        if math.isnan(float(num)): return True
        if math.isinf(float(num)): return True
    except:
        return False
    return False

def run_fix():
    db = SessionLocal()
    print("🧹 SCANNING FOR CORRUPTED DATA (NaN)...")
    
    # 1. Fix Accounts
    accs = db.query(Account).all()
    fixed_accs = 0
    for a in accs:
        if is_bad(a.balance):
            print(f"   ⚠️ Fixing Account '{a.name}': {a.balance} -> 0.0")
            a.balance = 0.0
            fixed_accs += 1
            
    # 2. Fix Transactions
    txs = db.query(Transaction).all()
    fixed_txs = 0
    for t in txs:
        if is_bad(t.amount):
            print(f"   ⚠️ Fixing Transaction '{t.description}': {t.amount} -> 0.0")
            t.amount = 0.0
            fixed_txs += 1
            
    db.commit()
    print(f"✅ REPAIR COMPLETE. Fixed {fixed_accs} accounts and {fixed_txs} transactions.")
    db.close()

if __name__ == "__main__":
    run_fix()
