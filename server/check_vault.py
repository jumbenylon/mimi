from app.database import SessionLocal
from app.models import Transaction, Investment, Account
from sqlalchemy import text

def audit_vault():
    print("🕵️‍♂️ CONNECTING TO NEON CLOUD VAULT...")
    db = SessionLocal()
    
    try:
        # 1. Check Connection
        db.execute(text("SELECT 1"))
        print("✅ Connection Established.\n")
        
        # 2. Count Money
        tx_count = db.query(Transaction).count()
        asset_count = db.query(Investment).count()
        acc_count = db.query(Account).count()
        
        print(f"📊 VAULT CONTENTS:")
        print(f"   - Transactions: {tx_count}")
        print(f"   - Assets (Stocks/Land): {asset_count}")
        print(f"   - Accounts: {acc_count}")
        
        # 3. Check specific High-Value items
        print("\n💎 HIGH VALUE ASSETS FOUND:")
        assets = db.query(Investment).filter(Investment.value > 10000000).all()
        for a in assets:
            print(f"   - {a.name}: {a.value:,.0f} TZS")
            
    except Exception as e:
        print(f"❌ CONNECTION FAILED: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    audit_vault()
