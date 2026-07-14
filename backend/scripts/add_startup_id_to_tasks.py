from database.db import engine
from sqlalchemy import text

dialect_name = engine.dialect.name

with engine.connect() as conn:
    cols = []
    try:
        if dialect_name == "sqlite":
            res = conn.execute(text("PRAGMA table_info('tasks')"))
            cols = [row[1] for row in res]
        else:
            res = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='tasks'"))
            cols = [row[0] for row in res]
    except Exception as e:
        print("Could not determine table columns:", e)

    if 'startup_id' in cols:
        print('Column startup_id already exists on tasks table.')
    else:
        try:
            print('Adding startup_id column to tasks table...')
            conn.execute(text('ALTER TABLE tasks ADD COLUMN startup_id INTEGER'))
            conn.commit()
            print('Column added successfully.')
        except Exception as e:
            print('Failed to add column:', e)
            print('You may need to run a manual migration or recreate the database.')
