from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# ✅ YOUR LIVE NEON CONNECTION STRING
# We keep this exactly as you had it
NEON_DB_URL = "postgresql://neondb_owner:npg_kCEMwbUA36rT@ep-bold-union-ahngk0dy-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# --- THE FIX: ROBUST CONNECTION POOLING ---
# pool_pre_ping=True: Checks if connection is alive before using it
# pool_recycle=300: Refreshes connection every 5 minutes
engine = create_engine(
    NEON_DB_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
