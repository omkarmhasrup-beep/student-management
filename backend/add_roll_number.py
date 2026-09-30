import os
from dotenv import load_dotenv
load_dotenv()
from sqlalchemy import create_engine, text

engine = create_engine(os.getenv('DATABASE_URL'))
with engine.connect() as conn:
    print("Adding roll_number column")
    conn.execute(text("ALTER TABLE students ADD COLUMN roll_number VARCHAR(50);"))
    conn.commit()
print("Done")
