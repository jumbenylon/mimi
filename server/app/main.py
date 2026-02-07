from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

# Import your existing modules
from .database import SessionLocal, engine, Base
from .models import Account, Transaction, Investment, LoanSchedule, Loan 
# (Make sure Loan is imported if you use it, otherwise rely on loans_api)

from . import loans_api

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- 1. CORS (CRITICAL FOR MOBILE/VERCEL ACCESS) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows ALL origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. DATABASE DEPENDENCY (Prevents Freezing) ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 3. DATA MODELS (For Input Validation) ---
class TransactionModel(BaseModel):
    date: str
    description: str
    amount: float
    category: str
    asset_name: Optional[str] = None
    quantity: Optional[float] = 0
    buy_price: Optional[float] = 0

# --- 4. ROUTERS ---
app.include_router(loans_api.router)

# --- 5. HEALTH CHECKS ---
@app.get("/api/v1/health")
def health_check_v1():
    return {"status": "healthy", "service": "mimi-backend"}

@app.get("/")
def health_check_root():
    return {"status": "healthy", "message": "Mimi Finance Backend is Live"}

# --- 6. DASHBOARD API (Fixes Goals & Home Page) ---
@app.get("/api/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    # Fetch Data
    accounts = db.query(Account).all()
    investments = db.query(Investment).all()
    # Note: If you don't have a Loan model in models.py, this next line might fail. 
    # If it fails, remove the loan calculation lines.
    loans = db.query(Loan).all() if hasattr(db.query(Loan), 'all') else []
    
    # Calculate Totals
    total_cash = sum(a.balance for a in accounts if a.type in ["BANK", "WALLET"])
    total_investments = sum(i.quantity * i.current_price for i in investments)
    total_debt = sum(l.remaining_amount for l in loans) if loans else 0
    
    # Recent Transactions
    transactions = db.query(Transaction).order_by(Transaction.date.desc()).limit(5).all()

    return {
        "total_net_worth": (total_cash + total_investments) - total_debt,
        "total_cash": total_cash,
        "total_investments": total_investments,
        "total_debt": total_debt,
        "accounts": accounts,
        "transactions": transactions
    }

# --- 7. TRANSACTION API (Fixes Budget Page) ---
@app.get("/api/transactions")
def get_all_transactions(db: Session = Depends(get_db)):
    return {"transactions": db.query(Transaction).order_by(Transaction.date.desc()).all()}

# --- 8. SAVE TRANSACTION (Fixes the "+" Button) ---
@app.post("/api/transactions")
def create_transaction(tx: TransactionModel, db: Session = Depends(get_db)):
    # 1. Create Transaction Record
    new_tx = Transaction(
        date=tx.date,
        description=tx.description,
        amount=tx.amount,
        category=tx.category,
        account="Manual"
    )
    db.add(new_tx)
    
    # 2. IF INVESTMENT: Logic to update Portfolio
    if tx.category == "Investment" and tx.asset_name:
        existing = db.query(Investment).filter(Investment.name == tx.asset_name).first()
        
        if existing:
            # Update existing asset
            existing.quantity += tx.quantity
            # Update price to latest buy price
            existing.current_price = tx.buy_price 
            existing.value = existing.quantity * existing.current_price
        else:
            # Create new asset
            new_asset = Investment(
                name=tx.asset_name,
                category="DSE" if tx.asset_name in ["CRDB", "NMB", "TPCC"] else "UTT",
                quantity=tx.quantity,
                buy_price=tx.buy_price,
                current_price=tx.buy_price,
                value=tx.quantity * tx.buy_price,
                logo="" # Optional
            )
            db.add(new_asset)

    db.commit()
    return {"message": "Transaction Saved"}

# --- 9. INVESTMENT API (Fixes Invest Page) ---
@app.get("/api/investments")
def get_investments(db: Session = Depends(get_db)):
    assets = db.query(Investment).all()
    
    # Calculate Portfolio Summary
    total_val = sum(a.quantity * a.current_price for a in assets)
    total_cost = sum(a.quantity * a.buy_price for a in assets)
    
    # Format List
    portfolio = []
    for a in assets:
        val = a.quantity * a.current_price
        cost = a.quantity * a.buy_price
        gain_pct = ((val - cost) / cost * 100) if cost > 0 else 0
        
        portfolio.append({
            "name": a.name,
            "category": a.category,
            "qty": a.quantity,
            "price": a.current_price,
            "value": val,
            "gain_pct": gain_pct,
            "logo": a.logo
        })

    return {
        "summary": {
            "total_value": total_val,
            "total_gain": total_val - total_cost
        },
        "portfolio": portfolio
    }
