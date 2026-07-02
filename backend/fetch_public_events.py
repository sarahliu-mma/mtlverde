"""Pull public events from Montreal's open data portal and cache them as JSON.

Source: https://donnees.montreal.ca/dataset/evenements-publics
Run manually with `python fetch_public_events.py`, or via the scheduled
GitHub Action in .github/workflows/update-public-events.yml.
"""
import json
import os

import requests

RESOURCE_ID = "6decf611-6f11-4f34-bb36-324d804c9bad"
API_URL = "https://donnees.montreal.ca/api/3/action/datastore_search"
PAGE_SIZE = 1000

# type_evenement values to keep. The full dataset is mostly borough council
# meetings and administrative notices, so we filter down to the
# cultural/festival-style categories this app cares about.
RELEVANT_TYPES = {
    "Fête et marché",
    "Musique",
    "Cirque",
    "Exposition",
    "Danse",
    "Théâtre",
    "Humour",
    "Art et artisanat",
    "Cinéma",
    "Art de la parole",
}

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "public_events_montreal.json")


def fetch_all_records():
    records = []
    offset = 0
    while True:
        resp = requests.get(
            API_URL,
            params={"resource_id": RESOURCE_ID, "limit": PAGE_SIZE, "offset": offset},
            timeout=30,
        )
        resp.raise_for_status()
        batch = resp.json()["result"]["records"]
        if not batch:
            break
        records.extend(batch)
        offset += PAGE_SIZE
    return records


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
        "arrondissement": record.get("arrondissement"),
        "adresse_principale": record.get("adresse_principale"),
        "lat": lat,
        "long": long_,
    }


def main():
    records = fetch_all_records()
    filtered = [
        normalized
        for r in records
        if r.get("type_evenement") in RELEVANT_TYPES
        and (normalized := normalize(r)) is not None
    ]

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(filtered, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(filtered)} events to {OUTPUT_PATH} (from {len(records)} total records)")


if __name__ == "__main__":
    main()
