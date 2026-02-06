from app.database import SessionLocal
from app.main import Account

db = SessionLocal()
wallets = [
    {"name": "Mpesa 0753930000", "type": "WALLET"},
    {"name": "Mixx by Yas 0714021078", "type": "WALLET"}
]

for w in wallets:
    exists = db.query(Account).filter(Account.name == w['name']).first()
    if not exists:
        db.add(Account(name=w['name'], type=w['type'], balance=0.0))
        print(f"✅ Created: {w['name']}")
    else:
        print(f"ℹ️  {w['name']} already exists")

db.commit()
db.close()
