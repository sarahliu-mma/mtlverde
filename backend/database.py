import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.environ.get("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


ADDED_COLUMNS = [
    ("description_en", "VARCHAR"),
    ("inscription", "VARCHAR"),
]


def ensure_schema():
    with engine.begin() as conn:
        for table in ("public_events", "festivals"):
            for column_name, column_type in ADDED_COLUMNS:
                conn.execute(
                    text(
                        f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS "
                        f"{column_name} {column_type}"
                    )
                )
