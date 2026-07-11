import json
import os
import sys
from database import engine, SessionLocal, Base
from models import Festival, PublicEvent

Base.metadata.create_all(bind=engine)


def import_events(model, json_filename):
    """Upsert the events in `json_filename` into `model`'s table by id.

    Existing rows (matched on id) are updated in place; new rows are inserted.
    Idempotent -- safe to run on every refresh without creating duplicates.
    """
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

        existing = db.query(model).filter(model.id == event_id).first()

        if existing:
            for key, value in event.items():
                setattr(existing, key, value)
            updated += 1
        else:
            db.add(model(**event))
            created += 1

    db.commit()
    db.close()
    print(f"{model.__tablename__}: created {created}, updated {updated}, skipped {skipped}")


def import_festivals(json_filename="festivals_montreal.json"):
    import_events(Festival, json_filename)


def import_public_events(json_filename="public_events_montreal.json"):
    import_events(PublicEvent, json_filename)


if __name__ == "__main__":
    # Usage: python seed.py [festivals|public|all]   (default: all)
    target = sys.argv[1] if len(sys.argv) > 1 else "all"

    if target not in ("festivals", "public", "all"):
        sys.exit(f"Unknown target {target!r}; use festivals, public, or all.")
    if target in ("festivals", "all"):
        import_festivals()
    if target in ("public", "all"):
        import_public_events()
