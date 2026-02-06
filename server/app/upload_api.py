from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import shutil
import os
from .database import SessionLocal
from .models import Account, Transaction
from datetime import datetime

router = APIRouter()

@router.post("/api/upload-statement")
async def upload_statement(file: UploadFile = File(...)):
    file_path = f"temp_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        df = pd.read_csv(file_path)
        df.columns = df.columns.str.strip()
        db = SessionLocal()

        # Identify Bank
        if 'Column 1' in df.columns:
            bank_name, date_col, desc_col, amt_col = "ECOBANK", "Column 1", "Column 2", "Column 4"
        else:
            bank_name, date_col, desc_col, amt_col = "CRDB Bank", "Date", "Description", "Debit"

        acc = db.query(Account).filter(Account.name == bank_name).first()
        
        # Simple Import Logic
        for _, row in df.head(50).iterrows(): # Limit to 50 for speed
            try:
                val = str(row[amt_col]).replace(',', '')
                amt = float(val) if val.replace('.','',1).isdigit() else 0
                if amt == 0: continue
                
                db.add(Transaction(
                    date=datetime.now().date(), # Simplified for upload
                    description=str(row[desc_col])[:50],
                    amount=-amt,
                    category="General",
                    account_id=acc.id
                ))
            except: continue
        
        db.commit()
        db.close()
        os.remove(file_path)
        return {"message": f"Successfully imported to {bank_name}"}
    except Exception as e:
        if os.path.exists(file_path): os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))
