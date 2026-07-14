"""One-time backfill of description_en for existing database rows.

Some rows were seeded before the translation pipeline existed and have since
dropped out of the daily fetch, so the normal path never fills their English
description -- they show French on the site. This finds every row that has a
French description but no English one and translates it, reusing the shared
cache (only genuinely new text hits DeepL) and updating the row in place.

Idempotent: re-running only touches rows still missing a translation.
Run with DATABASE_URL and DEEPL_API_KEY set (e.g. via the GitHub Action).
"""
from database import SessionLocal, engine, Base, ensure_schema
from models import PublicEvent, Festival
from translate import translate_descriptions


def backfill(model):
    db = SessionLocal()
    try:
        rows = (
            db.query(model)
            .filter(model.description.isnot(None), model.description_en.is_(None))
            .all()
        )
        if not rows:
            print(f"{model.__tablename__}: nothing to backfill")
            return

        # Reuse the event-dict translator; it fills description_en via cache+DeepL.
        events = [{"description": r.description} for r in rows]
        translate_descriptions(events)

        updated = 0
        for row, event in zip(rows, events):
            en = event.get("description_en")
            if en:
                row.description_en = en
                updated += 1
        db.commit()
        print(f"{model.__tablename__}: backfilled {updated}/{len(rows)}")
    finally:
        db.close()


def main():
    Base.metadata.create_all(bind=engine)
    ensure_schema()
    backfill(PublicEvent)
    backfill(Festival)


if __name__ == "__main__":
    main()
