from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base, get_db
from .models import Account, Stock, NSSFContribution

# Initialize Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MIMI Mobile Core")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "active", "system": "MIMI v1"}

@app.get("/analytics")
def dashboard(db: Session = Depends(get_db)):
    accounts = db.query(Account).all()
    nssf = db.query(NSSFContribution).first()
    
    total_cash = sum(a.balance for a in accounts)
    net_worth = total_cash + (nssf.amount if nssf else 0)
    
    return {
        "net_worth": net_worth,
        "liquidity": total_cash,
        "accounts": accounts
    }

# THE SYNC / RESET BUTTON
@app.get("/sync")
def sync_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Seed the 5 Kings with Mobile Colors
    initial_data = [
        {"name": "CRDB Bank", "type": "Bank", "color": "emerald"},
        {"name": "Ecobank", "type": "Bank", "color": "blue"},
        {"name": "Selcom", "type": "Bank", "color": "cyan"},
        {"name": "Mixx by Yas", "type": "Wallet", "color": "purple"},
        {"name": "M-Pesa", "type": "Mobile", "color": "red"},
    ]
    
    for acc in initial_data:
        db.add(Account(name=acc["name"], type=acc["type"], color_code=acc["color"], balance=0.0))
    
    db.add(NSSFContribution(amount=0.0))
    
    db.commit()
    db.close()
    return {"status": "Synced", "message": "Database Wiped & Re-Seeded to Default"}
