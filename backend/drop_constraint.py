import os
from dotenv import load_dotenv
load_dotenv()
from sqlalchemy import create_engine, text

engine = create_engine(os.getenv('DATABASE_URL'))
with engine.connect() as conn:
    res = conn.execute(text("SELECT constraint_name FROM information_schema.table_constraints WHERE table_name='students' AND constraint_type='UNIQUE'"))
    for row in res:
        print(row)
        if 'email' in row[0]:
            print(f"Dropping {row[0]}")
            conn.execute(text(f"ALTER TABLE students DROP CONSTRAINT {row[0]}"))
    conn.commit()
print("Done")
