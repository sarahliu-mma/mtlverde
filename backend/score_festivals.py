"""Score the curated festivals once and write the badges back into
festivals_montreal.json. Festivals rarely change, so run this manually
whenever the festival list is updated (not in the daily pipeline)."""
import json, os
from sustainability_score import score_event
from mtl_transit_pipeline import load_stm_stops, load_bixi, make_transit_scorer

HERE = os.path.dirname(__file__)
PATH = os.path.join(HERE, "festivals_montreal.json")
STOPS = os.path.join(HERE, "stops.txt")

SCORE_FIELDS = (
    "sustainability_score", "badge", "badge_icon", "eco_flag", "free_flag",
    "score_breakdown", "score_reasons", "eco_flag_terms",
    "wheelchair_metro_accessible", "wheelchair_metro_m",
    "wheelchair_metro_gap_m", "wheelchair_note",
)

def main():
    festivals = json.load(open(PATH, encoding="utf-8"))
    stm = load_stm_stops(STOPS)
    try:
        bixi = load_bixi()
    except Exception as exc:
        print(f"BIXI unavailable ({exc}); scoring without BIXI bonus.")
        bixi = None
    transit = make_transit_scorer(stm, bixi)

    for fest in festivals:
        try:
            result = score_event(fest, transit_index=transit)
            fest.update({k: result[k] for k in SCORE_FIELDS})
        except Exception as exc:
            print(f"Scoring failed for {fest.get('id')}: {exc}")

    with open(PATH, "w", encoding="utf-8") as f:
        json.dump(festivals, f, ensure_ascii=False, indent=2)
    print(f"Scored {len(festivals)} festivals -> {PATH}")

if __name__ == "__main__":
    main()
