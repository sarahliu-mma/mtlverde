# MTLVerde — Meet the Montréal Community

A free, bilingual (🇫🇷 / 🇬🇧) website that surfaces Montréal's city-published
community events — workshops, cultural programming, outdoor activities, and
neighborhood happenings — on an interactive map, alongside a curated list of the
city's marquee festivals. Every event carries a **sustainability score** for how
low-carbon and barrier-free it is to attend, and an **AI assistant** answers
questions about what's on. It exists to help newcomers, recent graduates, young
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
- **Sustainability scoring** — every event gets a 0–100 score and an eco-badge
  (🌿🌿🌿 / 🌿🌿 / 🌿) estimating how low-carbon and barrier-free it is to
  *attend*, with a per-event breakdown of where the points came from.
- **Wheelchair accessibility signal** — reported alongside the score (never
  folded into it), based on distance to the nearest *accessible* metro station.
- **Ask MTLVerde** — an AI assistant (Anthropic Claude) that answers questions
  about the site and recommends real events from the database, rendering them as
  full event cards inline in the conversation.
- **Bilingual by default** — French is the source language; English is served
  from machine translations (DeepL) with graceful fallback to French. Locale is
  chosen from the browser's `Accept-Language` header and reflected in the URL
  (`/fr`, `/en`).
- **Filters** by event type, borough, audience, cost, and registration —
  multi-select on type, borough, and audience.
- **Save events for later** — heart any event to bookmark it. Works signed out
  (kept in your browser, no account needed) *or* signed in, where bookmarks sync
  to your account across devices. A header badge counts them, and events the city
  later removes drop off the list automatically.
- **Accounts** — optional email/password sign-up via Supabase. Guest bookmarks
  merge into your account on first sign-in, so nothing is lost.
- **Featured Festivals** — a curated, browsable page of Montréal's signature
  annual festivals, scored the same way as city events.
- **Sustainability ranking page** — top-scoring events grouped by eco-badge tier,
  plus the methodology behind the rubric.
- **Mobile-responsive** across every page, including a collapsible nav menu.
- **Self-updating data** via a daily GitHub Actions pipeline — no manual
  maintenance.

---

## Pages

| Route | What's there |
|-------|--------------|
| `/[lang]` | Home — hero, purpose, mission teaser, featured festivals, event map + list + filters, team, newsletter |
| `/[lang]/mission` | The problem, the approach, and who it's for |
| `/[lang]/festivals` | Curated marquee festivals, browsable with detail panel |
| `/[lang]/sustainability` | How scoring works, the rubric, and the ranked leaderboard by tier |
| `/[lang]/recommendations` | **Ask MTLVerde** — AI chat assistant |
| `/[lang]/saved` | Your bookmarked events (guest or account) |
| `/[lang]/login` | Sign in / create an account |

---

## Architecture

```
Ville de Montréal open data (CKAN API)      STM GTFS stops + BIXI GBFS
            │                                          │
            ▼                                          ▼
  fetch_public_events.py ──► DeepL FR→EN (cached)   transit index (KD-tree)
            │                        │                 │
            │                        │      sustainability_score.py
            ▼                        ▼                 ▼
  public_events_montreal.json + translations_cache.json   (committed by CI)
            │
            ▼
      seed.py ──► PostgreSQL (Railway)  ◄── festivals_montreal.json (curated)
            │
            ▼
   FastAPI backend  (/events, /events/all, /events/{id}/detail,
            │        /events/live-count, /chat ──► Anthropic Claude)
            ▼
   Next.js frontend (Vercel) — map, list, filters, i18n, scoring UI, chat
            │
            ▼
   Supabase — auth + per-user bookmarks (row-level security)
```

| Layer | Stack | Hosting |
|-------|-------|---------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Leaflet / markercluster | Vercel |
| Backend | FastAPI, SQLAlchemy | Railway |
| Database | PostgreSQL | Railway |
| Auth + bookmarks | Supabase (Postgres + RLS) | Supabase |
| AI assistant | Anthropic Claude (`claude-sonnet-4-6`) | Anthropic API |
| Translation | DeepL API (FR→EN, on-disk cache) | DeepL |
| Scoring | Python, `scipy` (KD-tree), STM GTFS + BIXI GBFS | GitHub Actions |
| Data pipeline | Python `requests`, GitHub Actions (cron) | GitHub |

---

## Repository layout

```
mtlverde/
├── backend/                        FastAPI service + data pipeline + scoring
│   ├── main.py                     API endpoints, date windows, gzip + cache headers
│   ├── chat.py                     /chat — Claude-backed assistant grounded on the DB
│   ├── recommendations.py          Tag-filter recommendation API (built, not wired to UI)
│   ├── models.py                   SQLAlchemy models (Festival, PublicEvent)
│   ├── database.py                 Engine, session, idempotent schema guard
│   ├── fetch_public_events.py      Pull + clean + filter + score city open data
│   ├── translate.py                DeepL FR→EN translation with on-disk cache
│   ├── backfill_translations.py    One-time backfill for missing English text
│   ├── sustainability_score.py     The rubric — weights, thresholds, keywords in CONFIG
│   ├── mtl_transit_pipeline.py     STM stops + BIXI stations → KD-tree transit index
│   ├── score_festivals.py          Score curated festivals, write badges back to JSON
│   ├── run_scoring.py              Local end-to-end scoring runner (not used in prod)
│   ├── seed.py                     Upsert JSON feeds into Postgres by id
│   ├── stops.txt                   STM GTFS stops (committed for reproducibility)
│   ├── festivals_montreal.json     Curated marquee festivals (source of truth)
│   ├── public_events_montreal.json City events snapshot (refreshed by CI)
│   ├── PUBLIC_EVENTS.md            Data dictionary: source, filters, breakdowns
│   ├── Sustainability_Scoring.md   Scoring model, fields, and how to run it
│   ├── Sustainability_Logic.md     Sustainability Scoring Methodology 
│   └── Procfile / requirements.txt Railway deploy config
├── frontend/                       Next.js app (App Router, [lang] routing)
│   ├── app/[lang]/                 Pages, Header, Map, EventCard, MultiSelect, dictionaries
│   │   ├── AuthProvider.js         App-wide Supabase auth state
│   │   ├── festivals/ mission/ recommendations/ saved/ sustainability/ login/
│   │   └── dictionaries/           fr.json (source) + en.json
│   └── lib/
│       ├── api.js                  Backend base URL
│       ├── supabase.js             Browser Supabase client
│       ├── bookmarks.js            Bookmarks store — localStorage (guest) / Supabase (account)
│       ├── useEventsFeed.js        Shared events feed with cross-tab fetch dedup
│       └── eventPhotos.js          Event-type → stock photo mapping
├── .github/workflows/
│   ├── update-public-events.yml    Daily fetch → translate → score → commit → seed
│   └── backfill-translations.yml   One-time translation backfill
├── Final_presentation.pdf          Final presentation slides
└── README.md
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
- **Sustainability scoring** attached in the same pass (see below).
- **Atomic writes** so a crash mid-refresh can never leave corrupt JSON.

Current snapshot: ~3,500 events across all 20 boroughs. See
[`backend/PUBLIC_EVENTS.md`](backend/PUBLIC_EVENTS.md) for the full data
dictionary and per-type / per-borough breakdowns.

**Curated festivals** live in `festivals_montreal.json` — a hand-maintained list
of Montréal's signature annual festivals, keyed by title slug.

---

## Sustainability scoring

Every event gets a **0–100 score** estimating how low-carbon and barrier-free it
is to **attend** — deliberately *not* the event's own carbon emissions, which the
open data can't support.

| Component | Max | What it measures |
|-----------|-----|------------------|
| Transit access | 45 | Distance to the nearest STM stop, with a BIXI active-transport bonus |
| Walk-in access | 35 | Whether you can just show up (no registration/ticket required) |
| Outdoor venue | 20 | Outdoor / green-space venues over indoor ones |

Badges cut at **90** (🌿🌿🌿 Green Leader) and **65** (🌿🌿 Eco-Friendly);
below that is 🌿 Getting There. Each event also carries a `score_breakdown` so
the UI can show exactly where its points came from.

**Wheelchair accessibility is reported alongside the score, never folded into
it** — an event shouldn't look "greener" because of an accessibility feature, or
vice versa. It's computed from the distance to the nearest *wheelchair-accessible*
metro station.

Transit distances come from **STM GTFS stops** (committed as `stops.txt` for
reproducibility) and **BIXI's live GBFS feed**, indexed with a `scipy` KD-tree
for fast nearest-stop lookup. Full model and rationale:
[`backend/Sustainability_Scoring.md`](backend/Sustainability_Scoring.md).

---

## Accounts & bookmarks

Bookmarks work with **two backends behind one interface**:

- **Signed out (guest)** — hearted event ids live in the browser's
  `localStorage`. No account, no tracking, works immediately.
- **Signed in** — bookmarks are rows in a Supabase `bookmarks` table, synced
  across devices. **Row-level security** scopes every query to the owning user,
  which is what actually protects the data (the publishable key is safe to ship
  in client code).

On first sign-in, any guest bookmarks are **merged into the account** and only
then cleared locally — so switching from guest to account never loses picks.

Only event **ids** are stored either way. The saved page intersects them against
the live feed, so events the city removes disappear automatically, and the
`/events/live-count` endpoint keeps the header badge accurate without shipping
the whole feed to the client.

---

## Ask MTLVerde (AI assistant)

`POST /chat` is backed by **Anthropic Claude** (`claude-sonnet-4-6`). It handles
two kinds of question:

1. **About MTLVerde** — what it is, its mission, how scoring works, where the
   data comes from. Answered only from a fixed brief in the system prompt, so it
   can't invent features.
2. **Event recommendations** — grounded strictly on events retrieved from the
   database by keyword match. It is instructed never to use outside knowledge
   about Montréal venues or festivals, and to say so honestly when nothing fits.

When it recommends an event it emits an `[id: EVENT_ID]` marker, which the
frontend replaces with a real event card (date, location, cost, eco-badge, save
button) rendered inline in the conversation.

**Reply language follows the language the user typed in**, auto-detected per
message, rather than the current UI locale.

Requires `ANTHROPIC_API_KEY` on the backend.

---

## API

Base URL: `https://mtlverde-production.up.railway.app`

| Endpoint | Returns |
|----------|---------|
| `GET /events` | Curated festivals that have not yet ended |
| `GET /events/public` | City open-data events overlapping the next 6 months |
| `GET /events/all` | Combined feed (festivals + public events) — used by the frontend |
| `GET /events/{id}/detail` | Heavier scoring fields for one event (`score_reasons`, `eco_flag_terms`, wheelchair distances), kept out of the list feeds |
| `POST /events/live-count` | Given `{ "ids": [...] }`, returns `{ "count": N }` — how many saved ids are still live (powers the saved badge) |
| `POST /chat` | Given `{ "message": "...", "lang": "en" }`, returns `{ "reply": "...", "events": [...] }` |
| `GET /api/recommendations` | Tag/flag-filtered event picks (`tags`, `location`, `free_only`, `eco_only`, `family_only`, `limit`) |
| `GET /api/recommendations/tags` | The available tag vocabulary for the above |

Both feeds share the same normalized event shape (title, description [FR + EN],
dates, type, audience, cost, borough, address, lat/long, sustainability score,
badge, score breakdown, wheelchair signal). Public events are served from
Postgres, falling back to the committed JSON file if the table has not been
seeded yet.

> **Note:** the `/api/recommendations` endpoints are live and functional but are
> not currently called by the frontend — the Recommendations page was rebuilt
> around the chat assistant. They remain available for direct API use.

### Performance

- **gzip compression** on responses over 1 KB.
- **`Cache-Control: public, max-age=300, stale-while-revalidate=86400`** on all
  feed endpoints.
- **Server-side rendering + ISR** on the home page (`revalidate: 300`), so events
  are baked into the initial HTML instead of a client-side waterfall.
- **Trimmed list payloads** — the list feeds ship only the fields the UI reads;
  heavier scoring detail is served per-event via `/events/{id}/detail`.
- **Cross-tab fetch dedup** in `useEventsFeed`, so multiple components and tabs
  share one in-flight request.

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

Environment variables:

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | yes | Postgres connection string |
| `DEEPL_API_KEY` | no | Enables FR→EN translation in `fetch_public_events.py`. Without it the fetch still runs and events keep cached English (or fall back to French). Free-tier keys end in `:fx`. |
| `ANTHROPIC_API_KEY` | no | Enables the `/chat` assistant. Without it `/chat` fails, but the rest of the API works. |

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

Environment variables (`.env.local`, and the same values in Vercel):

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | for accounts | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | for accounts | Supabase publishable (anon) key |

Without these, sign-in won't work but guest bookmarks and everything else still
do. The frontend fetches events from the Railway API (`/events/all`); CORS on the
backend allows `http://localhost:3000` and the production Vercel origin.

---

## Automated data sync

[`.github/workflows/update-public-events.yml`](.github/workflows/update-public-events.yml)
runs **daily at 06:00 UTC** (and on demand via `workflow_dispatch`):

1. Fetch the latest events, translate new descriptions (DeepL, cached), and
   attach sustainability scores + wheelchair signals.
2. Commit `public_events_montreal.json` + `translations_cache.json` if changed.
3. Seed the refreshed data into Postgres (`seed.py public`).

Required repository secrets: `DATABASE_URL` (Railway public connection string)
and `DEEPL_API_KEY`. If `DATABASE_URL` is absent the app still works via the
JSON fallback; only the seed step fails. See
[`backend/PUBLIC_EVENTS.md`](backend/PUBLIC_EVENTS.md#database-seeding--deployment)
for setup details.

[`.github/workflows/backfill-translations.yml`](.github/workflows/backfill-translations.yml)
is a one-time helper that fills in English for any events missing it.

---

## Team & context

| Member | Owns |
|--------|------|
| Yan-Ling Lu | Data pipeline, cleaning, processing |
| Sarah Liu | Backend development |
| Joohee Kim | Sustainability scoring |
| Chloee Liew | Frontend development |
