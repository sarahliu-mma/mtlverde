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
- **Snapshot:** 2026-07-03 — **3,690 events** (from 5,859 total records in the source)

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
| Sport et plein air | 1,085 |
| Art et artisanat | 420 |
| Heure du conte | 398 |
| Jeux | 344 |
| Musique | 285 |
| Cinéma | 224 |
| Théâtre | 217 |
| Fête et marché | 146 |
| Exposition | 132 |
| Club de lecture et littérature | 113 |
| Science et techno | 112 |
| Cirque | 75 |
| Danse | 71 |
| Cuisine | 31 |
| Jardinage | 16 |
| Art de la parole | 16 |
| Humour | 5 |
| **Total** | **3,690** |

> Note: "Sport et plein air" is dominated by recurring drop-in fitness/dance
> classes (Zumba, yoga, line dancing, etc.) rather than one-off events, which is
> why it is by far the largest bucket.

---

## Breakdown by arrondissement (neighborhood)

| Arrondissement | Events |
|----------------|-------:|
| Ville-Marie | 613 |
| Le Plateau-Mont-Royal | 385 |
| Ville de Montréal* | 379 |
| Rivière-des-Prairies–Pointe-aux-Trembles | 356 |
| Côte-des-Neiges–Notre-Dame-de-Grâce | 289 |
| Verdun | 243 |
| LaSalle | 168 |
| Saint-Laurent | 162 |
| Mercier–Hochelaga-Maisonneuve | 161 |
| Montréal-Nord | 138 |
| Lachine | 138 |
| Rosemont–La Petite-Patrie | 113 |
| Anjou | 108 |
| Ahuntsic-Cartierville | 107 |
| Outremont | 67 |
| Le Sud-Ouest | 66 |
| Villeray–Saint-Michel–Parc-Extension | 61 |
| Saint-Léonard | 61 |
| Pierrefonds-Roxboro | 59 |
| L'Île-Bizard–Sainte-Geneviève | 16 |
| **Total** | **3,690** |

> \* "Ville de Montréal" is not a real neighborhood — it is a catch-all the
> source uses for city-wide events not tied to a specific borough.
