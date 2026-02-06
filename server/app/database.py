from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# ✅ YOUR LIVE NEON CONNECTION STRING
NEON_DB_URL = "postgresql://neondb_owner:npg_kCEMwbUA36rT@ep-bold-union-ahngk0dy-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Create Engine
engine = create_engine(NEON_DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
