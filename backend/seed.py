import json
import os
import sys
import time
from sqlalchemy.exc import OperationalError
from database import engine, SessionLocal, Base, ensure_schema
from models import Festival, PublicEvent

Base.metadata.create_all(bind=engine)
ensure_schema()

# The DB can drop the connection mid-run (Railway's public proxy, or the server
# restarting). The upsert is idempotent, so on OperationalError we retry the
# whole pass with a fresh session and exponential backoff before giving up.
MAX_RETRIES = 4
RETRY_BACKOFF = 3  # seconds; doubles each attempt (3, 6, 12)


def _upsert_events(model, events):
    """Run one upsert pass in a fresh session. Raises on connection failure."""
    db = SessionLocal()
    created = 0
    updated = 0
    skipped = 0
    try:
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
    finally:
        db.close()
    return created, updated, skipped


def import_events(model, json_filename):
    """Upsert the events in `json_filename` into `model`'s table by id.

    Existing rows (matched on id) are updated in place; new rows are inserted.
    Idempotent -- safe to run on every refresh without creating duplicates.
    Retries the pass if the DB connection drops mid-run.
    """
    data_path = os.path.join(os.path.dirname(__file__), json_filename)
    with open(data_path, "r", encoding="utf-8") as f:
        events = json.load(f)

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            created, updated, skipped = _upsert_events(model, events)
            break
        except OperationalError as e:
            if attempt == MAX_RETRIES:
                raise
            wait = RETRY_BACKOFF * 2 ** (attempt - 1)
            print(
                f"DB connection error on {model.__tablename__} "
                f"(attempt {attempt}/{MAX_RETRIES}): {e.orig}. "
                f"Retrying in {wait}s..."
            )
            time.sleep(wait)

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
