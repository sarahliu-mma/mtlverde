"""
sustainability_score.py  (v4)
=============================
Sustainability / low-carbon-accessibility scoring for MTLVerde (BUSA 649).
The score (0-100) is a PROXY for how low-carbon and accessible it is to ATTEND
an event, not a measurement of its carbon footprint.

Importable functions so teammates can call them directly:
    from sustainability_score import score_event
    result = score_event(event_dict, transit_index)
"""
from __future__ import annotations
import unicodedata
import pandas as pd

# --- CONFIG: whole rubric in one place -------------------------------------
CONFIG = {
    "weights": {"transit_access": 45, "outdoor_green": 20, "walkin_access": 35},
    "outdoor_values": {"outdoor": 1.0, "indoor": 0.4, "unknown": 0.5},
    "walkin_values":  {"Entrée libre": 1.0, "Sur inscription": 0.3, "Avec billet": 0.15},
    # Thresholds cut at the natural valleys in the real score distribution
    # (65 and 90), so the top badge means something (~15% of events).
    "badges": [(90, "Green Leader", "🌿🌿🌿"),
               (65, "Eco-Friendly", "🌿🌿"),
               (0,  "Getting There", "🌿")],
    # NARROW keyword list on purpose: only real sustainability practices, so we
    # do NOT flag "plein air"/"outdoor" (already scored) or vague marketing.
    "eco_keywords": [
        "zero waste","zero-waste","zero dechet","compost","compostage","recycl",
        "recyclage","reutilisable","reusable","eco-responsable","ecoresponsable",
        "developpement durable","vegan","vegane","vegetalien","carbon neutral",
        "carboneutre","plogging","plantation d'arbres","tree planting",
        "seconde main","second-hand","upcycl","recup ",
    ],
    "filter_out_emplacement": ["En ligne"],
    "filter_out_types": ["Conseil et comité", "Assemblée publique", "Consultation publique"],
}

def _strip_accents(text: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", str(text))
                   if unicodedata.category(c) != "Mn").lower()

def _venue_kind(emplacement: str) -> str:
    e = _strip_accents(emplacement)
    if "exterieur" in e or "plein air" in e or "outdoor" in e:
        return "outdoor"
    if "salle" in e or "indoor" in e:
        return "indoor"
    return "unknown"

# --- component sub-scores: return (subscore_0_1, reason) --------------------
def score_transit(event, transit_index=None):
    lat, lon = event.get("lat"), event.get("long")
    if transit_index is not None and pd.notna(lat) and pd.notna(lon):
        r = transit_index(lat, lon)
        return r["transit_subscore"], r["transit_reason"]
    idx = event.get("borough_transit_index", 0.5)
    return idx, f"Borough transit index {idx:.2f} (no coordinates)"

def score_outdoor(event):
    kind = _venue_kind(event.get("emplacement", ""))
    return CONFIG["outdoor_values"][kind], {
        "outdoor": "Outdoor venue", "indoor": "Indoor venue",
        "unknown": "Venue type unknown"}[kind]

def score_walkin(event):
    insc = str(event.get("inscription", "")).strip()
    val = CONFIG["walkin_values"].get(insc, 0.5)
    reason = {"Entrée libre": "Walk-in (no registration)",
              "Sur inscription": "Registration required",
              "Avec billet": "Ticket required"}.get(insc, "Access mode unknown")
    return val, reason

# --- flags (not scored) ----------------------------------------------------
def eco_flag(event):
    """Scan title + FR description + EN description (DeepL) for real
    sustainability practices. Accent-insensitive so broken French still matches.
    Self-reported: this reflects what the organizer advertises, not verified fact."""
    text = _strip_accents(f"{event.get('titre','')} {event.get('description','')} "
                          f"{event.get('description_en','')}")
    hits = sorted({kw.strip() for kw in CONFIG["eco_keywords"] if kw in text})
    return (len(hits) > 0), hits

def free_flag(event):
    return str(event.get("cout", "")).strip().lower() in {"gratuit", "free", "0"}

# --- aggregate -------------------------------------------------------------
_COMPONENTS = {
    "transit_access": score_transit,
    "outdoor_green":  lambda e, ti=None: score_outdoor(e),
    "walkin_access":  lambda e, ti=None: score_walkin(e),
}

def assign_badge(score):
    for threshold, name, icon in CONFIG["badges"]:
        if score >= threshold:
            return name, icon
    return CONFIG["badges"][-1][1], CONFIG["badges"][-1][2]

def score_event(event, transit_index=None) -> dict:
    """Score one event (dict/Series with cleaned fields). Returns the JSON
    contract used by the website (methodology §10).

    Wheelchair fields are reported ALONGSIDE the score, never folded into it.
    Rationale: the STM flag tells us whether the nearest STOP is boardable, not
    whether the VENUE is accessible — so scoring it would assert something the
    data cannot support. It is exposed as an independent filter instead, the
    same principle we applied to audience.
    """
    w = CONFIG["weights"]
    total, breakdown, reasons = 0.0, {}, []
    for key, fn in _COMPONENTS.items():
        sub, reason = fn(event, transit_index)
        pts = round(sub * w[key], 1)
        breakdown[key] = pts; total += pts; reasons.append(reason)
    total = round(min(100.0, total), 1)
    badge, icon = assign_badge(total)
    has_eco, eco_terms = eco_flag(event)

    out = {"sustainability_score": total, "badge": badge, "badge_icon": icon,
           "eco_flag": has_eco, "free_flag": free_flag(event),
           "score_breakdown": breakdown, "score_reasons": reasons,
           "eco_flag_terms": eco_terms,
           "wheelchair_metro_accessible": None, "wheelchair_metro_m": None,
           "wheelchair_metro_gap_m": None, "wheelchair_note": None}

    # attach wheelchair info from the transit index (does NOT change the score)
    lat, lon = event.get("lat"), event.get("long")
    if transit_index is not None and pd.notna(lat) and pd.notna(lon):
        t = transit_index(lat, lon)
        out["wheelchair_metro_accessible"] = t.get("wheelchair_metro_accessible")
        out["wheelchair_metro_m"] = t.get("wheelchair_metro_m")
        out["wheelchair_metro_gap_m"] = t.get("wheelchair_metro_gap_m")
        out["wheelchair_note"] = t.get("wheelchair_note")
    return out

def is_scorable(event) -> bool:
    """Exclude online + administrative events before scoring."""
    if str(event.get("emplacement", "")) in CONFIG["filter_out_emplacement"]:
        return False
    if str(event.get("type_evenement", "")) in CONFIG["filter_out_types"]:
        return False
    return True
