import json
import os
from database import engine, SessionLocal, Base
from models import Festival

Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()

    existing_count = db.query(Festival).count()
    if existing_count > 0:
        print(f"Database already has {existing_count} festivals. Skipping seed.")
        db.close()
        return

    data_path = os.path.join(os.path.dirname(__file__), "festivals_montreal.json")
    with open(data_path, "r", encoding="utf-8") as f:
        events = json.load(f)

    for event in events:
        festival = Festival(**event)
        db.add(festival)

    db.commit()
    db.close()
    print(f"Seeded {len(events)} festivals.")


if __name__ == "__main__":
    seed()
