import re
from pypdf import PdfReader
from datetime import datetime
from ..models import Transaction
from ..database import SessionLocal
from .categorizer import categorize_transaction

def parse_ecobank_statement(pdf_path, account_id):
    reader = PdfReader(pdf_path)
    db = SessionLocal()
    transactions_added = 0
    
    print(f"📂 Scanning PDF: {pdf_path}")

    # Aggressive Regex: Finds "DD-Mon-YYYY" anywhere in the line
    # e.g., "  01-Jan-2025 " or "01-Jan-2025"
    date_pattern = re.compile(r"(\d{2}-[A-Za-z]{3}-\d{4})")
    
    for page_num, page in enumerate(reader.pages):
        text = page.extract_text()
        if not text:
            continue
            
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip() # Remove leading/trailing spaces
            match = date_pattern.search(line)
            
            if match:
                try:
                    # Found a date!
                    date_str = match.group(1)
                    
                    # Skip lines that are just headers (contain "Date" but no real data)
                    if "Transaction Date" in line or "Value Date" in line:
                        continue

                    # Strategy: The Amount is usually at the very end (Balance) 
                    # or the 2nd/3rd to last item (Credit/Debit).
                    # Ecobank lines look like: DATE | DESC | VAL_DATE | DEBIT | CREDIT | BALANCE
                    
                    parts = line.split()
                    if len(parts) < 4: 
                        continue

                    # Clean numbers: remove commas
                    clean_parts = [p.replace(',', '') for p in parts]
                    
                    # Try to grab Credit (2nd to last) and Debit (3rd to last)
                    # We assume the last number is Balance, so ignore it for transaction amount.
                    
                    # Check if last items are numbers
                    def is_float(s):
                        try:
                            float(s)
                            return True
                        except ValueError:
                            return False

                    # Walk backwards to find the numbers
                    credit = 0.0
                    debit = 0.0
                    
                    # Index -1 is Balance (usually). 
                    # Index -2 is Credit. 
                    # Index -3 is Debit.
                    
                    if is_float(clean_parts[-2]):
                        credit = float(clean_parts[-2])
                    
                    if is_float(clean_parts[-3]):
                        debit = float(clean_parts[-3])
                        
                    # Calculate Amount
                    amount = credit if credit > 0 else -debit
                    
                    # If both are 0, this might be a multi-line row or header we missed. Skip.
                    if amount == 0:
                        continue

                    # Description: Everything between Date and the Numbers
                    # This is rough but effective for v1
                    desc_end_index = -3 
                    description = " ".join(parts[1:desc_end_index])
                    
                    # Categorize
                    category = categorize_transaction(description, amount)
                    
                    # Save
                    tx = Transaction(
                        date=datetime.strptime(date_str, "%d-%b-%Y"),
                        description=description[:200], # Limit length
                        amount=amount,
                        category=category,
                        account_id=account_id
                    )
                    db.add(tx)
                    transactions_added += 1
                    print(f"   found: {date_str} | {amount} | {description[:30]}...")

                except Exception as e:
                    # print(f"   skipped line: {line[:30]}... ({e})")
                    continue

    db.commit()
    db.close()
    print(f"✅ Success: Parsed and injected {transactions_added} transactions.")
    return transactions_added
