"""One-time backfill of titre_en / description_en for existing database rows.

Some rows were seeded before a translation field existed and have since dropped
out of the daily fetch, so the normal path never fills their English title or
description -- they show French on the site. This finds every row missing an
English value and translates it, reusing the shared cache (only genuinely new
text hits DeepL) and updating the row in place.

Idempotent: re-running only touches rows still missing a translation.
Run with DATABASE_URL and DEEPL_API_KEY set (e.g. via the GitHub Action).
"""
from database import SessionLocal, engine, Base, ensure_schema
from models import PublicEvent, Festival
from translate import translate_field


def backfill_field(db, model, src, dst):
    """Translate rows where src is set but dst (its _en column) is null."""
    src_col = getattr(model, src)
    dst_col = getattr(model, dst)
    rows = db.query(model).filter(src_col.isnot(None), dst_col.is_(None)).all()
    if not rows:
        print(f"{model.__tablename__}.{dst}: nothing to backfill")
        return

    # Reuse the event-dict translator; it fills dst via cache+DeepL.
    events = [{src: getattr(r, src)} for r in rows]
    translate_field(events, src, dst)

    updated = 0
    for row, event in zip(rows, events):
        en = event.get(dst)
        if en:
            setattr(row, dst, en)
            updated += 1
    db.commit()
    print(f"{model.__tablename__}.{dst}: backfilled {updated}/{len(rows)}")


def backfill(model):
    db = SessionLocal()
    try:
        backfill_field(db, model, "description", "description_en")
        backfill_field(db, model, "titre", "titre_en")
    finally:
        db.close()


def main():
    Base.metadata.create_all(bind=engine)
    ensure_schema()
    backfill(PublicEvent)
    backfill(Festival)


if __name__ == "__main__":
    main()
