from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Account(Base):
    __tablename__ = "accounts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    type = Column(String)  # BANK, WALLET, LOAN
    balance = Column(Float, default=0.0)
    transactions = relationship("Transaction", back_populates="account")
    # Link to schedule
    schedule = relationship("LoanSchedule", back_populates="account")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date)
    description = Column(String)
    amount = Column(Float)
    category = Column(String)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    account = relationship("Account", back_populates="transactions")

class Investment(Base):
    __tablename__ = "investments"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String)
    name = Column(String)
    quantity = Column(Float)
    buy_price = Column(Float)
    current_price = Column(Float)
    value = Column(Float)
    logo = Column(String)

class LoanSchedule(Base):
    __tablename__ = "loan_schedule"
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    installment_no = Column(Integer)
    due_date = Column(Date)
    repayment_amount = Column(Float)
    principal_component = Column(Float)
    interest_component = Column(Float)
    balance_after = Column(Float)
    status = Column(String, default="PENDING") # PAID, PENDING, OVERDUE
    
    account = relationship("Account", back_populates="schedule")
