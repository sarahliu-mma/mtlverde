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


def normalize(record):
    try:
        lat = float(record["lat"])
        long_ = float(record["long"])
    except (TypeError, ValueError):
        return None

    return {
        "titre": record.get("titre"),
        "url_fiche": record.get("url_fiche"),
        "description": record.get("description"),
        "date_debut": record.get("date_debut"),
        "date_fin": record.get("date_fin"),
        "type_evenement": record.get("type_evenement"),
        "public_cible": record.get("public_cible"),
        "emplacement": record.get("emplacement"),
        "cout": record.get("cout"),
        "arrondissement": clean_arrondissement(record.get("arrondissement")),
        "adresse_principale": record.get("adresse_principale"),
        "lat": lat,
        "long": long_,
    }


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

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(filtered, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(filtered)} events to {OUTPUT_PATH} (from {len(records)} total records)")


if __name__ == "__main__":
    main()
