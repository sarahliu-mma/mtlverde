"""
mtl_transit_pipeline.py
=======================
Download + process STM stops and BIXI stations, then compute the transit
sub-score (car-free reachability, with a BIXI active-transport bonus) for each
Montréal community event.

--------------------------------------------------------------------------
DATA (do this once, in an environment with internet)
--------------------------------------------------------------------------
1) EVENTS  : donnees.montreal.ca -> "Événements publics" (CSV with lat/long).
2) STM STOPS: stm.info/en/about/developers -> "Download GTFS" -> gtfs_stm.zip
              (fixed URL: https://www.stm.info/sites/default/files/gtfs/gtfs_stm.zip)
              Unzip; use `stops.txt` (a CSV). It contains BUS + METRO.
              `load_stm_stops` tags metro vs bus automatically (see below).
              Licence CC BY 4.0 -> credit STM.
3) BIXI    : live GBFS JSON (no download needed):
              https://gbfs.velobixi.com/gbfs/2-2/en/station_information.json
              Licence CC BY -> credit BIXI.
--------------------------------------------------------------------------
"""
from __future__ import annotations
import json, math, urllib.request
from pathlib import Path
import numpy as np
import pandas as pd
from scipy.spatial import cKDTree

# ---------------------------------------------------------------------------
EVENTS_PATH      = "events_raw.csv"
STM_STOPS_PATH   = "stops.txt"                 # the real GTFS stops.txt
BIXI_PATH_OR_URL = "https://gbfs.velobixi.com/gbfs/2-2/en/station_information.json"
LAT0 = 45.55

THRESHOLDS = [("metro",500,1.00),("metro",1000,0.75),("any",300,0.60),("any",600,0.40)]
NO_STOP_SCORE = 0.15
BIXI_BONUS = 0.15
BIXI_RADIUS_M = 300

# ---------------------------------------------------------------------------
# Geometry
# ---------------------------------------------------------------------------
def to_xy(lat, lon, lat0=LAT0):
    R = 6_371_000.0
    lat = np.asarray(lat, float); lon = np.asarray(lon, float)
    return np.column_stack([np.radians(lon)*R*math.cos(math.radians(lat0)),
                            np.radians(lat)*R])

def build_tree(df, lat_col="lat", lon_col="lon"):
    sub = df.dropna(subset=[lat_col, lon_col])
    return cKDTree(to_xy(sub[lat_col].values, sub[lon_col].values)) if len(sub) else None

def nearest_m(tree, lat, lon):
    if tree is None or pd.isna(lat) or pd.isna(lon):
        return math.inf
    return float(tree.query(to_xy([lat],[lon]))[0][0])

# ---------------------------------------------------------------------------
# Loaders
# ---------------------------------------------------------------------------
def load_events(path=EVENTS_PATH):
    return pd.read_csv(path)

def load_stm_stops(path=STM_STOPS_PATH):
    """Read STM GTFS stops.txt and tag metro vs bus.

    Real STM structure:
      location_type==1 -> the 68 metro stations             -> is_metro=1
      location_type==0 & parent_station empty -> bus stop    -> is_metro=0
      location_type==0 & parent_station set  -> metro platform (skipped;
                                                 the station coord represents it)
      location_type==2 -> entrances/exits (skipped)
    A minimal sample file that already has an `is_metro` column also works.
    """
    df = pd.read_csv(path)
    if "location_type" in df.columns:
        metro = df[df["location_type"] == 1].copy(); metro["is_metro"] = 1
        bus = df[(df["location_type"] == 0) & (df["parent_station"].isna())].copy()
        bus["is_metro"] = 0
        df = pd.concat([metro, bus], ignore_index=True)
    df = df.rename(columns={"stop_lat":"lat","stop_lon":"lon",
                            "wheelchair_boarding":"wheelchair"})
    if "is_metro" not in df.columns:
        df["is_metro"] = 0
    return df.dropna(subset=["lat","lon"]).reset_index(drop=True)

def load_bixi(path_or_url=BIXI_PATH_OR_URL):
    if str(path_or_url).startswith("http"):
        with urllib.request.urlopen(path_or_url, timeout=30) as r:
            payload = json.load(r)
    else:
        payload = json.loads(Path(path_or_url).read_text())
    return pd.DataFrame(payload["data"]["stations"])[["station_id","name","lat","lon"]]

# ---------------------------------------------------------------------------
# Transit scoring
# ---------------------------------------------------------------------------

# Wheelchair accessibility: how close is the nearest stop a wheelchair user can
# actually board at? GTFS wheelchair_boarding: 1 = accessible, 2 = not, 0 = unknown.
# In the real STM data only 25 of 68 metro stations are accessible (37%), and
# 833 of 8,914 bus stops are not — so a stop being "nearest" does not mean a
# wheelchair user can use it. We therefore index accessible stops SEPARATELY.
# WHY WE MEASURE THE METRO, NOT "any accessible stop":
# Our first attempt flagged "is there an accessible stop within 500 m" — but
# 91% of bus stops are accessible and the bus network is dense, so 98.6% of
# events came back "accessible". That fails our own low-variance guard (>90%
# sharing one value carries no information), exactly like `cout`.
# The binding constraint is the METRO: only 25 of 68 stations (37%) are
# wheelchair-accessible. Bus and metro are not equivalent services — the metro
# is faster and is what makes cross-city travel practical — so the real equity
# question is whether a wheelchair user can reach an event BY METRO.
WHEELCHAIR_METRO_M = 800          # walkable distance to an accessible metro station
WHEELCHAIR_MAX_REPORT_M = 3000    # beyond this, report "none nearby"


def make_transit_scorer(stm_stops, bixi_stations=None):
    metro_tree = build_tree(stm_stops[stm_stops["is_metro"] == 1])
    any_tree   = build_tree(stm_stops)
    bixi_tree  = build_tree(bixi_stations) if bixi_stations is not None else None

    # Metro stations a wheelchair user can actually board at (wheelchair == 1).
    # Only ~25 of 68 stations qualify, so this genuinely discriminates.
    if "wheelchair" in stm_stops.columns:
        wc_metro = stm_stops[(stm_stops["is_metro"] == 1) & (stm_stops["wheelchair"] == 1)]
        wc_metro_tree = build_tree(wc_metro) if len(wc_metro) else None
    else:
        wc_metro_tree = None

    def score(lat, lon):
        d_metro = nearest_m(metro_tree, lat, lon)
        d_any   = nearest_m(any_tree, lat, lon)
        d_bixi  = nearest_m(bixi_tree, lat, lon) if bixi_tree is not None else math.inf
        d_wcm   = nearest_m(wc_metro_tree, lat, lon) if wc_metro_tree is not None else math.inf

        sub, reason = NO_STOP_SCORE, "No stop within walking distance"
        for kind, limit, val in THRESHOLDS:
            d = d_metro if kind == "metro" else d_any
            if d <= limit:
                sub = val
                reason = f"{'Metro' if kind=='metro' else 'Stop'} within {int(d)} m"
                break
        note = ""
        if d_bixi <= BIXI_RADIUS_M:
            sub = min(1.0, sub + BIXI_BONUS); note = f" + BIXI {int(d_bixi)} m"

        # Wheelchair info sits ALONGSIDE the score, never inside it: the STM flag
        # tells us whether the STATION is boardable, not whether the VENUE is
        # accessible. Scoring it would assert something the data cannot support.
        wc_ok = (not math.isinf(d_wcm)) and d_wcm <= WHEELCHAIR_METRO_M
        if math.isinf(d_wcm) or d_wcm > WHEELCHAIR_MAX_REPORT_M:
            d_wcm_out = None
            wc_note = "No accessible metro station nearby"
        elif wc_ok:
            d_wcm_out = round(d_wcm)
            wc_note = f"Accessible metro {int(d_wcm)} m"
        else:
            d_wcm_out = round(d_wcm)
            wc_note = f"Nearest accessible metro {int(d_wcm)} m"

        # how much farther a wheelchair user must go than a rider who can use
        # ANY metro station — the concrete cost of an inaccessible network
        gap = None
        if not math.isinf(d_wcm) and not math.isinf(d_metro):
            gap = max(0, round(d_wcm - d_metro))

        return {"transit_subscore": round(sub,3), "transit_reason": reason+note,
                "dist_metro_m": None if math.isinf(d_metro) else round(d_metro),
                "dist_any_stop_m": None if math.isinf(d_any) else round(d_any),
                "dist_bixi_m": None if math.isinf(d_bixi) else round(d_bixi),
                "wheelchair_metro_m": d_wcm_out,
                "wheelchair_metro_accessible": bool(wc_ok),
                "wheelchair_metro_gap_m": gap,
                "wheelchair_note": wc_note}
    return score

def add_transit_scores(events, stm_stops, bixi_stations,
                       lat_col="lat", lon_col="long"):
    score = make_transit_scorer(stm_stops, bixi_stations)
    res = events.apply(lambda r: score(r.get(lat_col), r.get(lon_col)), axis=1)
    return pd.concat([events, pd.DataFrame(list(res), index=events.index)], axis=1)

# ---------------------------------------------------------------------------
if __name__ == "__main__":
    events = load_events(); stm = load_stm_stops(); bixi = load_bixi()
    print(f"events {len(events)} | STM stops {len(stm)} "
          f"(metro={int((stm['is_metro']==1).sum())}, bus={int((stm['is_metro']==0).sum())}) "
          f"| BIXI {len(bixi)}")
    keep = (events["emplacement"] != "En ligne")
    ev = events[keep & events["lat"].notna()].head(12)
    scored = add_transit_scores(ev, stm, bixi)
    print(scored[["titre","arrondissement","transit_subscore","transit_reason"]].to_string(index=False))
