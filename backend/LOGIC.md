# Sustainability Scoring — Logic & Methodology

**Component:** Sustainability scoring
**Product:** MTLVerde — bilingual discovery site for Montréal community events
**Purpose of this document:** explain the final scoring logic, how it was built, and why each decision was made.

## 1. Overview

Every event on MTLVerde receives a **0–100 sustainability score** and an **eco-badge**
(🌿🌿🌿 / 🌿🌿 / 🌿). The score estimates **how transit-friendly and barrier-free it
is to *attend* an event** — not the event's actual carbon emissions, which the
available open data cannot support. For a community event, most of the environmental
footprint isn't the event itself; it's how attendees travel to it. That is what the
score measures, and stating that boundary plainly is what keeps the indicator honest
rather than greenwashed.

Sustainability here is treated as more than "green": it is also **social**. A truly
sustainable event isn't only low-impact environmentally — it's one that people can
actually reach and take part in, regardless of their circumstances. So the score
deliberately combines an environmental dimension (transit, outdoor) with a social,
barrier-free dimension (walk-in access), and reports wheelchair accessibility
alongside.

The single most important idea in this work: **deciding what *not* to score was
harder and more consequential than deciding what to score.** Several signals we
initially planned to include turned out to carry no discriminating information, and
removing them is what makes the final score meaningful.

## 2. Final Scoring Logic

This is the current, final state of the model.

**Two dimensions, 100 points:**

| Dimension | Component | Weight | Field |
|---|---|---:|---|
| Environmental | Transit access (metro, bus, BIXI) | 45 | `lat`/`long` + STM + BIXI |
| | Outdoor / green venue | 20 | `emplacement` |
| Social | Walk-in access (no registration) | 35 | `inscription` |

**Transit access (45 pts)** — distance from the event to the nearest stop, via a
nearest-neighbour search:

| Condition | Sub-score | Points |
|---|---:|---:|
| Metro within 500 m | 1.00 | 45 |
| Metro within 1 km | 0.75 | 33.8 |
| Any stop within 300 m | 0.60 | 27 |
| Any stop within 600 m | 0.40 | 18 |
| No stop within walking distance | 0.15 | 6.8 |

A BIXI station within 300 m adds +0.15 (capped at 1.0).

**Outdoor venue (20 pts)** — `À l'extérieur` → 20; `En salle` → 8.

**Walk-in access (35 pts)** — `Entrée libre` → 35; `Sur inscription` → 10.5; `Avec billet` → 5.25.

**Badge tiers** — cut at the natural valleys in the real score distribution:

| Score | Badge |
|---|---|
| 90–100 | 🌿🌿🌿 Green Leader (~21%) |
| 65–89 | 🌿🌿 Eco-Friendly (~61%) |
| 0–64 | 🌿 Getting There (~18%) |

**Reported alongside the score, not inside it:**
- **eco-flag (🌱)** — organizer-advertised green practice, keyword-scanned from the description. Self-reported; triggers on ~10 events.
- **free-flag** — free admission (filter, since 98.9% are free).
- **wheelchair-by-metro** — whether an accessible metro station is within 800 m, plus the distance and the gap versus the nearest metro overall.

**Output fields (12):** `sustainability_score`, `badge`, `badge_icon`, `eco_flag`,
`free_flag`, `score_breakdown`, `score_reasons`, `eco_flag_terms`,
`wheelchair_metro_accessible`, `wheelchair_metro_m`, `wheelchair_metro_gap_m`,
`wheelchair_note`.

## 3. Approach & Methodology

**Guiding principle — the low-variance guard:** any field where more than ~90% of
events share a single value carries no information and is not scored. A model that
awards points for a near-constant field is measuring nothing.

**Why a transit-and-access proxy:** attendee travel is the largest environmental
lever for a community event, and event coordinates plus transit-stop locations let us
measure it precisely. Energy, waste, and catering — the actual footprint — are not in
the open data, so we do not claim to measure them.

**Data sources:**
- Ville de Montréal public events (CKAN API) — the events themselves.
- STM GTFS `stops.txt` — 68 metro + ~8,900 bus stops, incl. a wheelchair flag (CC BY 4.0).
- BIXI GBFS `station_information.json` — ~1,088 bike-share stations (CC BY).

## 4. How the Model Evolved

The final logic is the result of testing an initial design against the real data and
revising it. Each decision below is a "finding → decision" pair.

**Free admission — dropped from the score.** 98.9% of events are free (only ~60
paid). Scoring "free" would give almost everyone identical points. → Removed from the
score; kept as a filter/flag.

**Audience (`public_cible`) — kept out of the score.** A kids/seniors/family event is
*differently targeted*, not less sustainable; penalizing it would work against the
very users this project serves. It varies enough to be a useful filter, but it is
conceptually wrong to score. → Filter only.

**Walk-in access — raised (25 → 35).** `inscription` varies well (67% / 30% / 3%) and
captures a real barrier: a required, often French-only, online registration excludes
newcomers and the less digitally fluent. → Given more weight.

**Transit — raised (40 → 45).** 100% of the final events carry usable coordinates,
making it the best-measured signal, and it is the largest physical lever. → Given more
weight.

**Badge thresholds — reset (75/50 → 90/65).** With free-admission points removed, the
distribution shifted. Cutting at round numbers put ~70% of events in the top tier,
making the badge meaningless. → Re-cut at the natural valleys in the distribution (65
and 90), producing meaningful tiers.

**Wheelchair — redefined around the metro, kept out of the score.** The first version
("any accessible stop within 500 m") flagged 98.6% of events as accessible, because
91% of bus stops are accessible — it failed the low-variance guard. But bus and metro
aren't equivalent services, and only 25 of Montréal's 68 metro stations (37%) are
wheelchair-accessible. → Redefined to measure whether an event is reachable by an
*accessible metro station*, and reported separately from the score (the STM flag
describes the station, not the venue, so scoring it would overclaim).

**Summary table:**

| Signal | Originally | Finding | Decision |
|---|---|---|---|
| Free admission | scored (15) | 98.9% free | → filter |
| Audience | considered | wrong to penalize | → filter |
| Walk-in | 25 | varies well | → 35 |
| Transit | 40 | best-measured | → 45 |
| Wheelchair (any stop) | flag | 98.6% "accessible" | → redefined to metro, flagged not scored |

## 5. Key Findings

**Equity — transit-accessible ≠ wheelchair-accessible.** Because wheelchair access
was kept *separate* from the score, a contradiction became visible that a blended
number would have hidden: about **half of the top-rated (Green Leader) events cannot
be reached by an accessible metro station.** Only 25 of Montréal's 68 metro stations
are wheelchair-accessible. If wheelchair access had been folded into the score, this
gap would have disappeared into the average.

**Sensitivity — the weights are tested, not asserted.** Re-scoring all events across a
range of transit weights keeps badge rankings stable (Spearman ρ = 0.90–0.99), and the
equity finding survives the range of weightings tested. This shows the conclusions
reflect the city's real transit infrastructure, not arbitrary weighting choices.

**So what:** the tool is not only an event finder — it surfaces an accessibility
inequity in the city's own infrastructure that it did not create.

## 6. Limitations

- **Proxy, not measurement** — estimates transit-and-access, not emissions.
- **Straight-line distance** — nearest-stop distances are as-the-crow-flies, not walking routes, so they're mildly optimistic.
- **Station ≠ venue** — the STM wheelchair flag describes the station, not the event venue; we never claim the latter.
- **Self-reported eco-flag** — triggers on ~10 events because descriptions average ~100 characters; verified as precise (no false positives) but best-effort. Full-page scraping was considered and rejected: high effort, sparse signal, unverifiable.
- **BIXI seasonality** — year-round but reduced in winter; the bonus is a present-availability signal.

## 7. Framework Anchoring

- **SDG 11.2** — accessible, sustainable transport for all, esp. vulnerable groups → transit + walk-in + wheelchair analysis.
- **SDG 11.7** — universal access to inclusive, green, public space → outdoor venue + inclusion.
- **SDG 13** — climate action → overall framing.
- **ISO 20121** — sustainable event management; we cover the attendee-transport, venue, and social-inclusion dimensions, not procurement/waste/catering.
