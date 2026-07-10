from datetime import date
import json
import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import get_db, engine, Base
from models import Festival


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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://mtlverde0.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/events")
def get_events(db: Session = Depends(get_db)):
    # Hide festivals that have already ended (e.g. Francos, ended 2026-06-21),
    # so the curated feed stays current like /events/public. Dates are stored
    # as ISO strings, so a lexicographic comparison matches chronological order.
    # Ongoing festivals (started earlier, not yet ended) are kept because we
    # compare on date_fin; festivals with no end date are kept too.
    # NB: unlike /events/public we do NOT apply the 6-month horizon cap here --
    # the curated list is small and we want to surface marquee festivals even
    # if they are further out.
    today = date.today().isoformat()
    events = (
        db.query(Festival)
        .filter((Festival.date_fin >= today) | (Festival.date_fin.is_(None)))
        .all()
    )
    return events

@app.get("/events/public")
def get_public_events():
    data_path = os.path.join(os.path.dirname(__file__), "public_events_montreal.json")
    try:
        with open(data_path, "r", encoding="utf-8") as f:
            events = json.load(f)
    except (OSError, json.JSONDecodeError):
        # Missing or corrupt data file: fail with a clear 503 instead of a
        # raw 500 so clients can distinguish "temporarily unavailable" from
        # a real server bug.
        raise HTTPException(
            status_code=503,
            detail="Public events data is temporarily unavailable.",
        )
    today = date.today()
    horizon = add_months(today, HORIZON_MONTHS)
    return [e for e in events if in_window(e, today, horizon)]
