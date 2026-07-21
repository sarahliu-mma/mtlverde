# Sustainability Scoring — MTLVerde

Sustainability scoring for [MTLVerde](https://mtlverde0.vercel.app/en), a bilingual
discovery site for Montréal community events. This component assigns every event a
**0–100 sustainability score** and an **eco-badge** (🌿🌿🌿 / 🌿🌿 / 🌿), plus a
separate wheelchair-by-metro accessibility signal.

The score estimates **how low-carbon and barrier-free it is to *attend* an event**
— not the event's carbon emissions, which the open data can't support. For the
full reasoning behind the model, see [`LOGIC.md`](./LOGIC.md).

---

## What it does

For each event it computes:

| Field | Type | Example |
|---|---|---|
| `sustainability_score` | float 0–100 | `76.8` |
| `badge` / `badge_icon` | string | `"Eco-Friendly"` / `"🌿🌿"` |
| `eco_flag` / `eco_flag_terms` | bool / list | `true` / `["zéro déchet"]` |
| `free_flag` | bool | `true` |
| `score_breakdown` | dict | `{"transit_access": 45, "outdoor_green": 8, "walkin_access": 35}` |
| `score_reasons` | list | `["Metro 159 m", "Indoor", "Walk-in"]` |
| `wheelchair_metro_accessible` | bool | `false` |
| `wheelchair_metro_m` | int | `940` |
| `wheelchair_metro_gap_m` | int | `700` |
| `wheelchair_note` | string | `"Nearest accessible metro 940 m"` |

Score = transit access (45) + walk-in access (35) + outdoor venue (20). Badge cuts
at 90 and 65. Wheelchair accessibility is reported **alongside** the score, never
folded into it. See `LOGIC.md` for why.

---

## Files

| File | Role |
|---|---|
| `sustainability_score.py` | The rubric. `score_event(event, transit_index) -> dict`. All weights, thresholds, and keywords live in `CONFIG` at the top. |
| `mtl_transit_pipeline.py` | Loads STM stops + BIXI stations and builds the transit index (nearest-stop distances via a KD-tree). |
| `run_scoring.py` | Local end-to-end runner for testing: reads both JSON feeds, scores them, writes `events_scored.json`/`.csv`. **Not used in production** (see pipeline below). |
| `score_festivals.py` | Scores the curated festivals once and writes badges back into `festivals_montreal.json`. |
| `stops.txt` | STM GTFS stops (committed so scoring is reproducible without a live download). |

---

## How to run (locally)

Requires Python 3.10+ and internet (for the live BIXI feed).

```bash
pip install pandas numpy scipy requests

# Score city events + festivals end-to-end (for local testing):
python run_scoring.py
# -> writes events_scored.json and events_scored.csv

# Score just the festivals, writing badges back into the festival file:
python score_festivals.py
```

Put `stops.txt`, `public_events_montreal.json`, and `festivals_montreal.json` in
the same folder as the scripts. BIXI is fetched live from the GBFS feed; if it's
unreachable, scoring still runs (without the BIXI bonus).

---

## How it runs in production

Scoring is **built into the existing data pipeline**, not run by hand. There are
two feeds because the two data sources are different:

**City events** (~2,900, refreshed daily via the CKAN API):

```
CKAN API
  -> fetch_public_events.py   (fetch -> filter -> translate -> SCORE)
  -> public_events_montreal.json
  -> seed.py -> PostgreSQL (Railway)
```

Scoring is inserted into `fetch_public_events.py` (function `add_sustainability_scores`,
called right after translation). It runs automatically every day via the
`update-public-events` GitHub Action, so new events are scored with no manual step.
Each event is scored inside a `try/except`, so one bad record can never break the
daily run.

**Festivals** (12, curated by hand, rarely change):

```
festivals_montreal.json (curated)
  -> score_festivals.py   (run manually when the festival list changes)
  -> festivals_montreal.json (now with scores)
  -> seed.py -> PostgreSQL
```

`seed.py` writes every field present in the JSON, so no changes to it are needed —
it picks up the scoring fields automatically once the columns exist in the schema
(`models.py`).

---

## Database

The 12 scoring fields are columns on the shared `EventFields` in `models.py`
(`score_breakdown`, `score_reasons`, `eco_flag_terms` are `JSON`; the rest are
`Float`/`String`/`Boolean`/`Integer`). Because SQLAlchemy doesn't add columns to
existing tables, the `festivals` and `public_events` tables are dropped and
recreated when the schema changes, then re-seeded.

---

## Frontend

- **`EventCard.js`** — renders the eco-badge (icon + name) and a ♿ chip when the
  nearest accessible metro is within range. The badge links to the Sustainability
  page.
- **`sustainability/`** — the Sustainability page: an explainer (how the score
  works, what the tiers mean, wheelchair accessibility, limitations) plus a live
  ranking of every event by score with an expandable per-event breakdown.
- Badge names and page copy are translated via the `badge` and `sustainability`
  sections of `dictionaries/en.json` and `fr.json`.

---

## Data sources

- **Ville de Montréal — Événements publics** (CKAN API) — the events.
- **STM GTFS `stops.txt`** — 68 metro + ~8,900 bus stops incl. wheelchair flag (CC BY 4.0, credit STM).
- **BIXI GBFS `station_information.json`** — ~1,088 stations (CC BY, credit BIXI).

---

## Notes & limitations

- Distances are straight-line (as-the-crow-flies), not walking routes — mildly optimistic.
- The wheelchair flag describes the STM **station**, not the event **venue**.
- The eco-flag is **self-reported** (scanned from organizer descriptions) and triggers on ~10 events.
- The score is a **low-carbon accessibility proxy**, not a measurement of carbon emissions.

See [`LOGIC.md`](./LOGIC.md) for the full methodology, the decision history, and the
equity and sensitivity findings.
