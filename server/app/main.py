from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import SessionLocal, engine
from .models import Base, Account, Transaction, Investment
from . import loans_api # CRITICAL IMPORT

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(loans_api.router) # CRITICAL REGISTRATION

# --- EXISTING ENDPOINTS ---
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
            "accounts": banks, "loans": loans, "assets": assets, "transactions": transactions,
            "total_net_worth": total_cash + total_assets + total_debt,
            "total_cash": total_cash, "total_investments": total_assets, "total_debt": total_debt
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
            port.append({"name": a.name, "category": a.category, "qty": a.quantity, "price": a.current_price, "value": val, "logo": a.logo, "gain_pct": (val-cost)/cost*100 if cost else 0})
        return {"portfolio": port, "summary": {"total_value": total_val, "total_gain": total_val-total_cost, "gain_percentage": (total_val-total_cost)/total_cost*100 if total_cost else 0}}
    finally:
        db.close()

@app.get("/api/analytics")
async def get_analytics():
    db = SessionLocal()
    try:
        txs = db.query(Transaction).all()
        income = sum(t.amount for t in txs if t.amount > 0 and t.category == "Income")
        expense = sum(abs(t.amount) for t in txs if t.amount < 0 and t.category != "Transfer")
        cat_map = {}
        for t in txs:
            if t.amount < 0 and t.category != "Transfer":
                c = t.category or "Uncategorized"
                if c not in cat_map: cat_map[c] = {"id": c, "total": 0, "transactions": []}
                cat_map[c]["total"] += abs(t.amount)
                cat_map[c]["transactions"].append({"date": t.date, "desc": t.description, "amount": abs(t.amount)})
        breakdown = [{"category": c, "total": d["total"], "percentage": d["total"]/expense*100 if expense else 0, "items": d["transactions"]} for c, d in cat_map.items()]
        return {"income": income, "expense": expense, "net_savings": income-expense, "breakdown": sorted(breakdown, key=lambda x: x["total"], reverse=True)}
    finally:
        db.close()
