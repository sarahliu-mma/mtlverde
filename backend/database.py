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


def ensure_schema():
    """Add columns that create_all can't (it never alters existing tables).

    Idempotent via ADD COLUMN IF NOT EXISTS, so it is safe to run on every API
    boot and seed. This removes the deploy-ordering hazard: whichever runs
    first (API startup or the seed job) creates the column before it is used.
    Call after Base.metadata.create_all so the tables already exist.
    """
    with engine.begin() as conn:
        for table in ("public_events", "festivals"):
            conn.execute(
                text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS description_en VARCHAR")
            )
