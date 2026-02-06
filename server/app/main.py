from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import SessionLocal, engine
from .models import Base, Account, Transaction, Investment, LoanSchedule
from . import loans_api

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Enable CORS for Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the Loans API
app.include_router(loans_api.router)

# --- CRITICAL HEALTH CHECK (Required for Render) ---
@app.get("/")
def health_check():
    return {"status": "healthy", "message": "Mimi Finance Backend is Live"}

# --- DASHBOARD ENDPOINTS ---
@app.get("/api/dashboard")
async def get_dashboard():
    db = SessionLocal()
    try:
        accounts = db.query(Account).all()
        banks = [a for a in accounts if a.type in ["BANK", "WALLET"]]
        loans = [a for a in accounts if a.type == "LOAN"]
        assets = db.query(Investment).all()
        transactions = db.query(Transaction).order_by(Transaction.date.desc()).limit(50).all()
        
        total_assets = sum(a.value for a in assets)
        total_cash = sum(a.balance for a in banks)
        total_debt = sum(a.balance for a in loans)
        
        return {
            "accounts": banks, 
            "loans": loans, 
            "assets": assets, 
            "transactions": transactions,
            "total_net_worth": total_cash + total_assets + total_debt,
            "total_cash": total_cash, 
            "total_investments": total_assets, 
            "total_debt": total_debt
        }
    finally:
        db.close()

@app.get("/api/transactions")
async def get_all_transactions():
    db = SessionLocal()
    try:
        return {"transactions": db.query(Transaction).order_by(Transaction.date.desc()).all()}
    finally:
        db.close()

@app.get("/api/investments")
async def get_investments():
    db = SessionLocal()
    try:
        assets = db.query(Investment).all()
        port = []
        total_val = 0
        total_cost = 0
        for a in assets:
            val = a.quantity * a.current_price
            cost = a.quantity * a.buy_price
            total_val += val
            total_cost += cost
            port.append({
                "name": a.name, 
                "category": a.category, 
                "qty": a.quantity, 
                "price": a.current_price, 
                "value": val, 
                "logo": a.logo, 
                "gain_pct": (val-cost)/cost*100 if cost else 0
            })
        return {
            "portfolio": port, 
            "summary": {
                "total_value": total_val, 
                "total_gain": total_val-total_cost, 
                "gain_percentage": (total_val-total_cost)/total_cost*100 if total_cost else 0
            }
        }
    finally:
        db.close()
