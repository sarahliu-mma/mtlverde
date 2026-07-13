# MTLVerde — Meet the Montréal Community

A free, bilingual (🇫🇷 / 🇬🇧) website that surfaces Montréal's city-published
community events — workshops, cultural programming, outdoor activities, and
neighborhood happenings — on an interactive map, alongside a curated list of the
city's marquee festivals. It exists to help newcomers, recent graduates, young
families, and anglophones find the free community life happening in their
borough this weekend.

> Montréal receives roughly 50,000 newcomers a year and publishes 4,000+ free
> community events across its 20 boroughs — but that supply is buried in a
> French-only, bureaucratic calendar. MTLVerde turns it into something anyone
> can browse on a Friday afternoon.

**Repo:** [github.com/sarahliu-mma/mtlverde](https://github.com/sarahliu-mma/mtlverde) · **Live:** [mtlverde0.vercel.app](https://mtlverde0.vercel.app) · **API:** [mtlverde-production.up.railway.app](https://mtlverde-production.up.railway.app)

Built by **Team MTLVerde** for BUSA 649 (McGill MMA): Yan-Ling Lu, Sarah Liu,
Joohee Kim, and Chloee Liew.

---

## What it does

- **Interactive map + event list** of free/low-cost community events across all
  20 Montréal boroughs, easier to browse than the city's own calendar.
- **Bilingual by default** — French is the source language; English is served
  from machine translations with graceful fallback to French. Locale is chosen
  from the browser's `Accept-Language` header and reflected in the URL (`/fr`,
  `/en`).
- **Filters** by event type, borough, audience, cost, and registration.
- **Two blended feeds:** ~3,500 city open-data events plus a hand-curated list
  of ~12 signature festivals (Jazz Festival, MURAL, Francofolies, …).
- **Self-updating data** via a daily GitHub Actions pipeline — no manual
  maintenance.

---

## Architecture

```
Ville de Montréal open data (CKAN API)
            │
            ▼
  fetch_public_events.py ──► DeepL FR→EN translation (cached)
            │                        │
            ▼                        ▼
  public_events_montreal.json + translations_cache.json   (committed by CI)
            │
            ▼
      seed.py ──► PostgreSQL (Railway)  ◄── festivals_montreal.json (curated)
            │
            ▼
   FastAPI backend  (/events, /events/public, /events/all)
            │
            ▼
   Next.js frontend (Vercel) — map, list, filters, i18n
```

| Layer | Stack | Hosting |
|-------|-------|---------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Leaflet / react-leaflet | Vercel |
| Backend | FastAPI, SQLAlchemy | Railway |
| Database | PostgreSQL | Railway |
| Data pipeline | Python `requests`, DeepL API, GitHub Actions (cron) | GitHub |

---

## Repository layout

```
mtlverde/
├── backend/                        FastAPI service + data pipeline
│   ├── main.py                     API endpoints and date-window filtering
│   ├── models.py                   SQLAlchemy models (Festival, PublicEvent)
│   ├── database.py                 Engine, session, idempotent schema guard
│   ├── fetch_public_events.py      Pull + clean + filter city open data
│   ├── translate.py                DeepL FR→EN translation with on-disk cache
│   ├── seed.py                     Upsert JSON feeds into Postgres by id
│   ├── festivals_montreal.json     Curated marquee festivals (source of truth)
│   ├── public_events_montreal.json City events snapshot (refreshed by CI)
│   ├── PUBLIC_EVENTS.md            Data dictionary: source, filters, breakdowns
│   └── Procfile / requirements.txt Railway deploy config
├── frontend/                       Next.js app (App Router, [lang] routing)
│   └── app/[lang]/                 Pages, map, header, i18n dictionaries
└── .github/workflows/
    └── update-public-events.yml    Daily fetch → commit → seed Postgres
```

---

## Data

**Source:** Ville de Montréal open data —
[Événements publics](https://donnees.montreal.ca/dataset/evenements-publics),
via the CKAN `datastore_search` API.

The pipeline (`fetch_public_events.py`) pulls the full dataset and reduces it to
the events this app cares about:

- **Category whitelist** — keeps 17 cultural/festival-style event types, drops
  civic/administrative noise (council meetings, consultations, classes).
- **Excludes online events** (no meaningful map location) and **past events**.
- **6-month horizon** — only events starting within the next six months.
- **Mojibake repair** on borough names, **stable numeric event ids** derived
  from the montreal.ca event URL (so refreshes upsert cleanly), and a
  **stale-data guard** that refuses to publish a suspiciously small result.
- **Atomic writes** so a crash mid-refresh can never leave corrupt JSON.

Current snapshot: ~3,500 events across all 20 boroughs. See
[`backend/PUBLIC_EVENTS.md`](backend/PUBLIC_EVENTS.md) for the full data
dictionary and per-type / per-borough breakdowns.

**Curated festivals** live in `festivals_montreal.json` — a hand-maintained list
of Montréal's signature annual festivals, keyed by title slug.

---

## API

Base URL: `https://mtlverde-production.up.railway.app`

| Endpoint | Returns |
|----------|---------|
| `GET /events` | Curated festivals that have not yet ended |
| `GET /events/public` | City open-data events overlapping the next 6 months |
| `GET /events/all` | Combined feed (festivals + public events) — used by the frontend |

Both feeds share the same normalized event shape (title, description [FR + EN],
dates, type, audience, cost, borough, address, lat/long). Public events are
served from Postgres, falling back to the committed JSON file if the table has
not been seeded yet.

---

## Running locally

```bash
git clone https://github.com/sarahliu-mma/mtlverde.git
cd mtlverde
```

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

export DATABASE_URL="postgresql://user:pass@localhost:5432/mtlverde"
python seed.py all          # load festivals + public events into Postgres
uvicorn main:app --reload   # serves on http://localhost:8000
```

Optional environment variables:

- `DATABASE_URL` — Postgres connection string (required).
- `DEEPL_API_KEY` — enables FR→EN translation in `fetch_public_events.py`.
  Without it, the fetch still runs and events keep whatever cached English they
  have (or fall back to French). Free-tier keys end in `:fx`.

To refresh the open-data snapshot manually:

```bash
python fetch_public_events.py   # rewrites public_events_montreal.json
```

### Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:3000, redirects to /fr or /en
```

The frontend fetches events from the Railway API (`/events/all`). CORS on the
backend allows `http://localhost:3000` and the production Vercel origin.

---

## Automated data sync

[`.github/workflows/update-public-events.yml`](.github/workflows/update-public-events.yml)
runs **daily at 06:00 UTC** (and on demand via `workflow_dispatch`):

1. Fetch the latest events and translate new descriptions (DeepL, cached).
2. Commit `public_events_montreal.json` + `translations_cache.json` if changed.
3. Seed the refreshed data into Postgres (`seed.py public`).

Required repository secrets: `DATABASE_URL` (Railway public connection string)
and `DEEPL_API_KEY`. If `DATABASE_URL` is absent the app still works via the
JSON fallback; only the seed step fails. See
[`backend/PUBLIC_EVENTS.md`](backend/PUBLIC_EVENTS.md#database-seeding--deployment)
for setup details.

---

## Team & context

| Member | Owns |
|--------|------|
| Yan-Ling Lu | Data pipeline, cleaning, processing |
| Sarah Liu | Frontend development |
| Joohee Kim | Sustainability scoring |
| Chloee Liew | Backend |

