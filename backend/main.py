from chat import router as chat_router
from datetime import date
import json
import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import get_db, engine, Base, ensure_schema
from models import Festival, PublicEvent


HORIZON_MONTHS = 6


def add_months(d, months):
    """Return the date `months` months after d (clamped to end of month)."""
    month_index = d.month - 1 + months
    year = d.year + month_index // 12
    month = month_index % 12 + 1
    day = min(d.day, [31, 29 if year % 4 == 0 and (year % 100 or not year % 400)
                      else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1])
    return date(year, month, day)


def in_window(event, today, horizon):
    """Keep events overlapping [today, horizon].

    An event is kept when it has not fully ended (date_fin today or later) and
    has not-yet started beyond the horizon (date_debut on or before horizon).
    Events with unparseable dates are kept rather than silently dropped.
    """
    try:
        if date.fromisoformat(event.get("date_debut")) > horizon:
            return False
    except (TypeError, ValueError):
        pass

    for key in ("date_fin", "date_debut"):
        value = event.get(key)
        try:
            return date.fromisoformat(value) >= today
        except (TypeError, ValueError):
            continue
    return True

app = FastAPI()

Base.metadata.create_all(bind=engine)
ensure_schema()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://mtlverde0.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def query_festivals(db, today):
    """Curated festivals that have not ended yet.

    Compares on date_fin so ongoing festivals are kept; festivals with no end
    date are kept too. No 6-month horizon cap -- the curated list is small and
    we want to surface marquee festivals even if they are further out.
    """
    today_s = today.isoformat()
    return (
        db.query(Festival)
        .filter((Festival.date_fin >= today_s) | (Festival.date_fin.is_(None)))
        .all()
    )


def query_public_events(db, today, horizon):
    """Public events overlapping [today, horizon], served from Postgres.

    Falls back to the JSON file if the table has not been seeded yet, so the
    endpoint keeps working during migration. Remove the fallback once the
    scheduled job seeds Postgres reliably.
    """
    today_s = today.isoformat()
    horizon_s = horizon.isoformat()
    rows = (
        db.query(PublicEvent)
        .filter(
            (PublicEvent.date_fin >= today_s) | (PublicEvent.date_fin.is_(None)),
            (PublicEvent.date_debut <= horizon_s) | (PublicEvent.date_debut.is_(None)),
        )
        .all()
    )
    if rows:
        return rows

    data_path = os.path.join(os.path.dirname(__file__), "public_events_montreal.json")
    try:
        with open(data_path, "r", encoding="utf-8") as f:
            events = json.load(f)
    except (OSError, json.JSONDecodeError):
        raise HTTPException(
            status_code=503,
            detail="Public events data is temporarily unavailable.",
        )
    return [e for e in events if in_window(e, today, horizon)]


def _order_key(today_s):
    """Build a sort key that surfaces the soonest-relevant events first.

    Ordering (dates are ISO "YYYY-MM-DD" strings, so string order is
    chronological):
      1. Upcoming events (start on/after today), nearest start first.
      2. Ongoing events (already started, not yet ended), ending soonest first.
      3. Events with no start date, last.
    Works for both ORM rows (attribute) and JSON-fallback dicts (key).
    """

    def key(event):
        get = event.get if isinstance(event, dict) else (lambda k: getattr(event, k))
        start = get("date_debut") or ""
        if not start:
            return (2, "")
        if start >= today_s:
            return (0, start)
        return (1, get("date_fin") or "9999-12-31")

    return key


@app.get("/events")
def get_events(db: Session = Depends(get_db)):
    today = date.today()
    return sorted(query_festivals(db, today), key=_order_key(today.isoformat()))


@app.get("/events/public")
def get_public_events(db: Session = Depends(get_db)):
    today = date.today()
    return sorted(
        query_public_events(db, today, add_months(today, HORIZON_MONTHS)),
        key=_order_key(today.isoformat()),
    )


@app.get("/events/all")
def get_all_events(db: Session = Depends(get_db)):
    # Combined feed: curated festivals + public events, each with its own date
    # filter, unioned and sorted so upcoming events (festivals and public events
    # interleaved) appear first, nearest start date first.
    today = date.today()
    horizon = add_months(today, HORIZON_MONTHS)
    festivals = query_festivals(db, today)
    publics = query_public_events(db, today, horizon)
    return sorted(list(festivals) + list(publics), key=_order_key(today.isoformat()))

app.include_router(chat_router)
