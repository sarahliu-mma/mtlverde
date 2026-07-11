"""Pull public events from Montreal's open data portal and cache them as JSON.

Source: https://donnees.montreal.ca/dataset/evenements-publics
Run manually with `python fetch_public_events.py`, or via the scheduled
GitHub Action in .github/workflows/update-public-events.yml.
"""
import json
import os
import re
from datetime import date

import requests

RESOURCE_ID = "6decf611-6f11-4f34-bb36-324d804c9bad"
API_URL = "https://donnees.montreal.ca/api/3/action/datastore_search"
PAGE_SIZE = 1000
HEADERS = {"User-Agent": "mtlverde-backend/1.0 (+https://github.com/yanling-lu/mtlverde)"}

# type_evenement values to keep. The full dataset is mostly borough council
# meetings and administrative notices, so we filter down to the
# cultural/festival-style categories this app cares about.
RELEVANT_TYPES = {
    "Fête et marché",
    "Sport et plein air",
    "Heure du conte",
    "Jeux",
    "Science et techno",
    "Club de lecture et littérature",
    "Musique",
    "Cirque",
    "Exposition",
    "Danse",
    "Théâtre",
    "Humour",
    "Art et artisanat",
    "Cinéma",
    "Art de la parole",
    "Jardinage",
    "Cuisine",
}

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "public_events_montreal.json")

# Stale guard: refuse to publish a suspiciously small dataset.
# SHRINK_RATIO is the primary guard -- it is relative to the previous run, so it
# adapts to the feed's seasonal drift (a rolling 6-month, summer-heavy window)
# while still catching a sudden cliff. MIN_EXPECTED is only a backstop for when
# there is no previous count (first run, or the file was deleted); it is set
# with headroom below the current ~3,400 so a legitimate off-season dip does not
# false-abort. Revisit both after observing a full seasonal cycle.
MIN_EXPECTED = 2000
SHRINK_RATIO = 0.6


def fetch_all_records():
    records = []
    offset = 0
    while True:
        resp = requests.get(
            API_URL,
            params={"resource_id": RESOURCE_ID, "limit": PAGE_SIZE, "offset": offset},
            headers=HEADERS,
            timeout=30,
        )
        resp.raise_for_status()
        batch = resp.json()["result"]["records"]
        if not batch:
            break
        records.extend(batch)
        offset += PAGE_SIZE
    return records


HORIZON_MONTHS = 6


def add_months(d, months):
    """Return the date `months` months after d (clamped to end of month)."""
    month_index = d.month - 1 + months
    year = d.year + month_index // 12
    month = month_index % 12 + 1
    # Clamp day so e.g. Aug 31 + 6 months -> Feb 28/29, not an invalid date.
    day = min(d.day, [31, 29 if year % 4 == 0 and (year % 100 or not year % 400)
                      else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1])
    return date(year, month, day)


def in_window(record, today, horizon):
    """Keep events overlapping [today, horizon].

    An event is kept when it has not fully ended (date_fin today or later) and
    has not-yet started beyond the horizon (date_debut on or before horizon).
    Records with unparseable dates are kept rather than silently dropped.
    """
    try:
        if date.fromisoformat(record.get("date_debut")) > horizon:
            return False
    except (TypeError, ValueError):
        pass

    for key in ("date_fin", "date_debut"):
        value = record.get(key)
        try:
            return date.fromisoformat(value) >= today
        except (TypeError, ValueError):
            continue
    return True


def clean_arrondissement(value):
    """Repair mojibake in arrondissement names.

    Some source records have runs of U+FFFD replacement characters where an
    en-dash belongs (e.g. "Rivière-des-Prairies��� Pointe-aux-Trembles"),
    which otherwise show up as a separate, broken neighborhood. Collapse any
    run of replacement characters back to a single en-dash.
    """
    if not value:
        return value
    return re.sub(r"�+", "–", value)


def event_id(record):
    """Return a stable unique id for an event.

    Uses the trailing numeric slug of montreal.ca's event page URL
    (e.g. ".../mon-evenement-87905" -> "87905"). This is the city's own
    stable event id, so it survives dataset refreshes -- unlike CKAN's
    internal `_id`, which can be reassigned when the source is reloaded.
    Falls back to the full url_fiche if no numeric slug is present.
    """
    url = record.get("url_fiche") or ""
    match = re.search(r"-(\d+)$", url)
    return match.group(1) if match else (url or None)


def normalize(record):
    try:
        lat = float(record["lat"])
        long_ = float(record["long"])
    except (TypeError, ValueError):
        return None

    return {
        "id": event_id(record),
        "titre": record.get("titre"),
        "url_fiche": record.get("url_fiche"),
        "description": record.get("description"),
        "date_debut": record.get("date_debut"),
        "date_fin": record.get("date_fin"),
        "type_evenement": record.get("type_evenement"),
        "public_cible": record.get("public_cible"),
        "emplacement": record.get("emplacement"),
        "inscription": record.get("inscription"),
        "cout": record.get("cout"),
        "arrondissement": clean_arrondissement(record.get("arrondissement")),
        "adresse_principale": record.get("adresse_principale"),
        "lat": lat,
        "long": long_,
    }


def previous_count():
    """Number of events in the currently-published file, or None if absent."""
    try:
        with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
            return len(json.load(f))
    except (OSError, json.JSONDecodeError):
        return None


def main():
    today = date.today()
    horizon = add_months(today, HORIZON_MONTHS)
    records = fetch_all_records()
    filtered = [
        normalized
        for r in records
        if r.get("type_evenement") in RELEVANT_TYPES
        and r.get("emplacement") != "En ligne"
        and in_window(r, today, horizon)
        and (normalized := normalize(r)) is not None
    ]

    # Stale guard: abort (non-zero exit) rather than overwrite good data with a
    # suspiciously small result, e.g. a source outage, schema change, or empty
    # response. This also stops the scheduled workflow from committing bad data.
    prev = previous_count()
    if len(filtered) < MIN_EXPECTED:
        raise SystemExit(
            f"Refusing to write: only {len(filtered)} events "
            f"(floor is {MIN_EXPECTED}). Source may be degraded."
        )
    if prev and len(filtered) < prev * SHRINK_RATIO:
        raise SystemExit(
            f"Refusing to write: {len(filtered)} events is under {SHRINK_RATIO:.0%} "
            f"of the previous {prev}. Source may be degraded."
        )

    # Atomic write: dump to a temp file in the same directory, then os.replace()
    # it into place. os.replace is atomic on the same filesystem, so a crash
    # mid-write can never leave a truncated/corrupt JSON file for the API to serve.
    tmp_path = OUTPUT_PATH + ".tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(filtered, f, ensure_ascii=False, indent=2)
    os.replace(tmp_path, OUTPUT_PATH)

    print(f"Wrote {len(filtered)} events to {OUTPUT_PATH} (from {len(records)} total records)")


if __name__ == "__main__":
    main()
