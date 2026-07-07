# Public Events Data (`/events/public`)

This document describes the public events feed served by the MTLVerde backend:
where the data comes from, how it is filtered, and the current breakdown of
events by type and by neighborhood.

- **Source:** Ville de Montréal open data — [Événements publics](https://donnees.montreal.ca/dataset/evenements-publics)
- **API:** CKAN `datastore_search` (resource `6decf611-6f11-4f34-bb36-324d804c9bad`)
- **Pipeline:** [`fetch_public_events.py`](fetch_public_events.py) pulls + filters the data into
  [`public_events_montreal.json`](public_events_montreal.json), refreshed weekly by
  [`.github/workflows/update-public-events.yml`](../.github/workflows/update-public-events.yml)
- **Endpoint:** `GET /events/public` in [`main.py`](main.py)
- **Snapshot:** 2026-07-07 — **3,532 events** (from 5,780 total records in the source)

---

## Unique identifier

Every event carries an **`id`** field for stable identification — this lets the
PostgreSQL import on Railway upsert cleanly (tell new events from existing ones)
without creating duplicates.

- `id` is the trailing numeric slug of the montreal.ca event page URL
  (e.g. `.../dans-loeil-du-lievre-87905` → `"87905"`). It is the city's own
  stable event id, so it survives dataset refreshes — unlike CKAN's internal
  `_id`, which can be reassigned when the source is reloaded.
- In the current snapshot the `id` is present and **unique for all 3,532
  events** (title + start date is *not* safe as a key — it collides on ~200+
  events).
- Use it as the **primary key** on the events table and upsert with
  `INSERT ... ON CONFLICT (id) DO UPDATE`.

The curated festivals feed (`festivals_montreal.json`, served at `GET /events`)
also carries an `id`, but as a **slug derived from the title** (e.g.
`"Festival MURAL"` → `festival-mural`) since those hand-maintained entries have
no numeric city id. Slugs are stable, human-readable, unique across the 12
festivals, and do not collide with the numeric public-event ids — so both feeds
can share one Postgres table. The `festivals` table's `id` column is therefore
typed as text (`String`), not integer.

---

## Filters

Filters are applied in two places. Static filters (category, online, mojibake
cleanup) run only at **fetch time**. Date-relative filters (past events, 6-month
cap) run at **both fetch time and request time**, so the feed stays accurate
between weekly refreshes.

| # | Filter | Rule | Applied at |
|---|--------|------|------------|
| 1 | **Category whitelist** | Keep only cultural / festival-style `type_evenement` values (17 categories, listed below). Excludes civic/administrative types (council meetings, consultations, support groups, classes like Informatique/Langues, etc.). | Fetch |
| 2 | **Exclude online events** | Drop records where `emplacement == "En ligne"` — they have no meaningful map location. | Fetch |
| 3 | **Exclude past events** | Drop events that have fully ended (`date_fin` before today). Ongoing events that started earlier but haven't ended are kept. Falls back to `date_debut` when `date_fin` is missing. | Fetch + request |
| 4 | **6-month horizon cap** | Drop events starting more than 6 months from today (`date_debut` after today + 6 months). | Fetch + request |
| 5 | **Mojibake repair** | Normalize corrupted `arrondissement` names — collapse runs of the U+FFFD replacement character back to an en-dash (e.g. a garbled "Rivière-des-Prairies…Pointe-aux-Trembles" merges into the correct neighborhood). | Fetch |

**Kept categories (filter #1):** Fête et marché, Sport et plein air, Heure du conte,
Jeux, Science et techno, Club de lecture et littérature, Musique, Cirque, Exposition,
Danse, Théâtre, Humour, Art et artisanat, Cinéma, Art de la parole, Jardinage, Cuisine.

**Records with unparseable dates** are kept rather than silently dropped by the
date filters (#3, #4).

---

## Breakdown by event type

| Type | Events |
|------|-------:|
| Sport et plein air | 1,025 |
| Art et artisanat | 401 |
| Heure du conte | 388 |
| Jeux | 324 |
| Musique | 280 |
| Cinéma | 208 |
| Théâtre | 208 |
| Fête et marché | 139 |
| Exposition | 133 |
| Club de lecture et littérature | 113 |
| Science et techno | 108 |
| Danse | 74 |
| Cirque | 66 |
| Cuisine | 31 |
| Jardinage | 15 |
| Art de la parole | 14 |
| Humour | 5 |
| **Total** | **3,532** |

> Note: "Sport et plein air" is dominated by recurring drop-in fitness/dance
> classes (Zumba, yoga, line dancing, etc.) rather than one-off events, which is
> why it is by far the largest bucket.

---

## Breakdown by arrondissement (neighborhood)

| Arrondissement | Events |
|----------------|-------:|
| Ville-Marie | 607 |
| Ville de Montréal* | 360 |
| Le Plateau-Mont-Royal | 359 |
| Rivière-des-Prairies–Pointe-aux-Trembles | 339 |
| Côte-des-Neiges–Notre-Dame-de-Grâce | 285 |
| Verdun | 230 |
| LaSalle | 161 |
| Mercier–Hochelaga-Maisonneuve | 155 |
| Saint-Laurent | 150 |
| Lachine | 133 |
| Montréal-Nord | 132 |
| Anjou | 103 |
| Ahuntsic-Cartierville | 102 |
| Rosemont–La Petite-Patrie | 100 |
| Saint-Léonard | 62 |
| Le Sud-Ouest | 62 |
| Outremont | 61 |
| Villeray–Saint-Michel–Parc-Extension | 59 |
| Pierrefonds-Roxboro | 57 |
| L'Île-Bizard–Sainte-Geneviève | 15 |
| **Total** | **3,532** |

> \* "Ville de Montréal" is not a real neighborhood — it is a catch-all the
> source uses for city-wide events not tied to a specific borough.
