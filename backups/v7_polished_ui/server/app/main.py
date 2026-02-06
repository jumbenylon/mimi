from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base, get_db
from .models import Account, Transaction
from sqlalchemy import Column, Integer, String, Float
from datetime import datetime, date
import calendar
from pydantic import BaseModel
from sqlalchemy import desc, func, extract, and_

# --- MODELS ---
class Goal(Base):
    __tablename__ = "goals"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    target_amount = Column(Float)
    current_amount = Column(Float)
    monthly_contribution = Column(Float)
    color = Column(String)

Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. DASHBOARD ---
@app.get("/api/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    accounts = db.query(Account).all()
    bank_balance = sum(a.balance for a in accounts if a.type == "BANK")
    
    # Loans
    loan_accounts = db.query(Account).filter(Account.type == "LOAN").all()
    loans_data = []
    for loan in loan_accounts:
        name = loan.name.upper()
        current = abs(loan.balance)
        if "ECOBANK" in name: original = 34500000.0; next_due = "2026-02-25"
        elif "LOLC" in name: original = 21450000.0; next_due = "2026-03-01"
        else: original = current * 1.2; next_due = "Unknown"
        loans_data.append({"name": loan.name, "original": original, "balance": current, "paid": original - current, "next_due": next_due, "next_amount": 0})

    recent_txs = db.query(Transaction).order_by(Transaction.date.desc()).limit(10).all()
    
    # Goals
    goals = db.query(Goal).all()
    goals_data = [{"id": g.id, "name": g.name, "target": g.target_amount, "current": g.current_amount, "monthly": g.monthly_contribution, "color": g.color} for g in goals]
    
    return {
        "bank_balance": bank_balance,
        "loans": loans_data,
        "transactions": recent_txs or [],
        "goals": goals_data
    }

# --- 2. INVESTMENTS ---
@app.get("/api/investments")
def get_investments():
    # LAND
    land_assets = [
        {"name": "Arusha (Nambala, Kikwe)", "details": "740 Sqm", "val": 12500000},
        {"name": "Arusha (Nganana, Arumeru)", "details": "800 Sqm", "val": 9500000},
        {"name": "Mabwepande (Bunju)", "details": "800 Sqm", "val": 19000000},
        {"name": "Kinondoni Shamba", "details": "357 Sqm", "val": 19500000},
    ]
    # VEHICLES
    vehicles = [
        {"name": "BMW X3", "details": "Premium Insured (Auto Loan)", "val": 43800000},
        {"name": "BMW 1 Series", "details": "Premium Insured", "val": 16000000},
        {"name": "Toyota Chaser", "details": "3rd Party Insured", "val": 3000000},
    ]
    # STOCKS & FUNDS
    stocks = [
        {"sym": "CRDB", "shares": 1744, "buy_price": 678, "curr_price": 2320, "logo": "/crdb.png", "trend": [2100, 2320]},
        {"sym": "NICO", "shares": 720, "buy_price": 774, "curr_price": 3350, "logo": "/nico.webp", "trend": [3100, 3350]},
        {"sym": "NMB", "shares": 100, "buy_price": 5100, "curr_price": 11110, "logo": "/nmb.jpeg", "trend": [10800, 11110]},
        {"sym": "DCB", "shares": 180, "buy_price": 166, "curr_price": 350, "logo": "/dcb.jpeg", "trend": [340, 350]},
        {"sym": "MBP", "shares": 20, "buy_price": 350, "curr_price": 1240, "logo": "/mkb.png", "trend": [1400, 1240]},
        {"sym": "PAL", "shares": 10, "buy_price": 360, "curr_price": 310, "logo": "/precision.jpg", "trend": [350, 310]},
    ]
    utt_funds = [
        {"name": "Umoja Unit Trust", "acc": "191558920", "val": 10000, "trend": [10000, 10000]},
        {"name": "Wekeza Maisha", "acc": "200146813", "val": 10000, "trend": [10000, 10000]},
        {"name": "Watoto Fund", "acc": "300222246", "val": 10000, "trend": [10000, 10000]},
        {"name": "Jikimu Fund", "acc": "400165074", "val": 10000, "trend": [10000, 10000]},
        {"name": "Liquid Fund", "acc": "501044095", "val": 10000, "trend": [10000, 10000]},
        {"name": "Bond Fund", "acc": "600374330", "val": 10000, "trend": [10000, 10000]},
    ]

    dse_val = sum(s["curr_price"] * s["shares"] for s in stocks)
    utt_val = sum(f["val"] for f in utt_funds)
    land_val = sum(l["val"] for l in land_assets)
    vehicle_val = sum(v["val"] for v in vehicles)

    return {
        "summary": {
            "total_value": dse_val + utt_val + land_val + vehicle_val,
            "total_profit": dse_val - sum(s["buy_price"] * s["shares"] for s in stocks)
        },
        "assets": [
            {"category": "DSE", "name": "Stock Exchange", "value": dse_val, "stocks": stocks, "land": [], "funds": [], "vehicles": []},
            {"category": "UTT", "name": "UTT AMIS", "value": utt_val, "stocks": [], "land": [], "funds": utt_funds, "vehicles": []},
            {"category": "Land", "name": "Real Estate", "value": land_val, "stocks": [], "land": land_assets, "funds": [], "vehicles": []},
            {"category": "Vehicles", "name": "Fleet", "value": vehicle_val, "stocks": [], "land": [], "funds": [], "vehicles": vehicles}
        ]
    }

# --- 3. ANALYTICS ---
@app.get("/api/analytics")
def get_analytics(period: str = Query("ALL"), db: Session = Depends(get_db)):
    dates = db.query(extract('year', Transaction.date), extract('month', Transaction.date))\
              .distinct().order_by(desc(extract('year', Transaction.date)), desc(extract('month', Transaction.date))).all()
    available_periods = [f"{int(y)}-{int(m):02d}" for y, m in dates]

    query = db.query(Transaction)
    if period != "ALL":
        try:
            year, month = map(int, period.split('-'))
            _, last_day = calendar.monthrange(year, month)
            start_date = date(year, month, 1)
            end_date = date(year, month, last_day)
            query = query.filter(and_(Transaction.date >= start_date, Transaction.date <= end_date))
        except: pass

    transactions = query.all()
    income = sum(t.amount for t in transactions if t.amount > 0 and t.category == "Income")
    expenses = sum(abs(t.amount) for t in transactions if t.amount < 0)
    
    breakdown_map = {}
    for t in transactions:
        if t.amount >= 0: continue
        cat = t.category
        if cat not in breakdown_map: breakdown_map[cat] = {"total": 0, "items": []}
        breakdown_map[cat]["total"] += abs(t.amount)
        breakdown_map[cat]["items"].append({"desc": t.description, "amount": abs(t.amount), "date": t.date})

    breakdown_list = []
    for cat, data in breakdown_map.items():
        breakdown_list.append({"name": cat, "value": data["total"], "items": sorted(data["items"], key=lambda x: x['amount'], reverse=True)})
    breakdown_list.sort(key=lambda x: x['value'], reverse=True)

    return {"period": period, "available_periods": available_periods, "income": income, "expenses": expenses, "breakdown": breakdown_list}

# --- 4. TRANSACTIONS ---
class TransactionCreate(BaseModel):
    description: str
    amount: float
    category: str
    date: str

@app.post("/api/transactions")
def create_transaction(tx: TransactionCreate, db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.type == "BANK").first()
    real_amount = abs(tx.amount) if "Income" in tx.category else -abs(tx.amount)
    new_tx = Transaction(
        date=datetime.strptime(tx.date, "%Y-%m-%d"),
        description=tx.description,
        amount=real_amount,
        category=tx.category,
        account_id=account.id if account else 1
    )
    if account: account.balance += real_amount
    db.add(new_tx)
    db.commit()
    return {"status": "success", "id": new_tx.id}
