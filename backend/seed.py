import json
import os
import sys
from database import engine, SessionLocal, Base
from models import Festival

Base.metadata.create_all(bind=engine)


def import_festivals(json_filename="festivals_montreal.json"):
    db = SessionLocal()

    data_path = os.path.join(os.path.dirname(__file__), json_filename)
    with open(data_path, "r", encoding="utf-8") as f:
        events = json.load(f)

    created = 0
    updated = 0
    skipped = 0

    for event in events:
        event_id = event.get("id")

        if not event_id:
            print(f"Skipping event with no id: {event.get('titre', 'unknown')}")
            skipped += 1
            continue

        existing = db.query(Festival).filter(Festival.id == event_id).first()

        if existing:
            for key, value in event.items():
                setattr(existing, key, value)
            updated += 1
        else:
            db.add(Festival(**event))
            created += 1

    db.commit()
    db.close()
    print(f"Done. Created: {created}, Updated: {updated}, Skipped: {skipped}")


if __name__ == "__main__":
    filename = sys.argv[1] if len(sys.argv) > 1 else "festivals_montreal.json"
    import_festivals(filename)
