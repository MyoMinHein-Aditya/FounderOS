from database.db import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        print("Adding goal_id column to tasks table...")
        conn.execute(text("ALTER TABLE tasks ADD COLUMN goal_id INTEGER REFERENCES goals(id)"))
        conn.commit()
        print("Column goal_id added successfully.")
    except Exception as e:
        print("Failed to add column:", e)
