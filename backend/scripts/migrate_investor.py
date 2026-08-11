import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.db import engine
from database.base import Base
import models.users
import models.startup
import models.investment

from sqlalchemy import text

# For existing tables, we can try to use ALTER TABLE
def apply_migrations():
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'founder'"))
            print("Added role to users")
        except Exception as e:
            print(f"Error adding role to users (might exist): {e}")

        try:
            conn.execute(text("ALTER TABLE startups ADD COLUMN revenue FLOAT DEFAULT 0.0"))
            print("Added revenue to startups")
        except Exception as e:
            print(f"Error adding revenue to startups (might exist): {e}")

        try:
            conn.execute(text("ALTER TABLE startups ADD COLUMN stats JSON"))
            print("Added stats to startups")
        except Exception as e:
            print(f"Error adding stats to startups (might exist): {e}")

    # Create any new tables (like investments)
    Base.metadata.create_all(bind=engine)
    print("Created new tables successfully.")

if __name__ == "__main__":
    apply_migrations()
