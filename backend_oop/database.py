import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # If a deployed database URL is provided (e.g., PostgreSQL), use it.
    engine = create_engine(DATABASE_URL)
else:
    # Fallback to local SQLite
    SQLALCHEMY_DATABASE_URL = "sqlite:///./founder_os_v2.db"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
