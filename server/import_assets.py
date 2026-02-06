import pandas as pd
import os
from app.database import SessionLocal, engine
from app.models import Base, Investment
from sqlalchemy import text

# Ensure table exists
Base.metadata.create_all(bind=engine)

def run_import():
    print("💎 IMPORTING ASSETS...")
    db = SessionLocal()
    
    # 1. Wipe Old Assets
    db.execute(text("DELETE FROM investments"))
    db.commit()
    
    # 2. Check File
    csv_file = "assets.csv"
    if not os.path.exists(csv_file):
        # Try parent dir
        if os.path.exists(f"../{csv_file}"): csv_file = f"../{csv_file}"
        else:
            print("❌ Error: assets.csv not found.")
            return

    # 3. Load Data
    try:
        df = pd.read_csv(csv_file)
        count = 0
        for _, row in df.iterrows():
            # Calculate value dynamically if needed, or use CSV
            qty = float(row['quantity'])
            price = float(row['current_price'])
            val = qty * price
            
            # Logo path cleanup (remove leading slash if needed)
            logo_path = str(row['meta_data']).strip()
            
            inv = Investment(
                category=row['category'],
                name=row['name'],
                quantity=qty,
                buy_price=float(row['buy_price']),
                current_price=price,
                value=val,
                logo=logo_path
            )
            db.add(inv)
            count += 1
            
        db.commit()
        print(f"✅ Successfully imported {count} assets.")
        
    except Exception as e:
        print(f"❌ Import Failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_import()
