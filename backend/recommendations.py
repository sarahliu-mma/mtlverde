import random
from typing import List, Optional
from fastapi import APIRouter, Query
from sqlalchemy import or_

from database import SessionLocal
from models import Festival, PublicEvent

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

# Maps frontend tag keys to actual type_evenement values in the DB
TYPE_TAG_MAP = {
    "music": ["Musique"],
    "art": ["Art et artisanat", "Art de la parole"],
    "performance": ["Théâtre", "Cirque", "Danse", "Humour"],
    "film": ["Cinéma"],
    "exhibition": ["Exposition"],
    "market": ["Fête et marché"],
    "food": ["Cuisine"],
    "outdoor": ["Sport et plein air"],
    "tech": ["Science et techno"],
    "reading": ["Club de lecture et littérature"],
    "kids": ["Heure du conte", "Jeux", "Jardinage"],
}

FAMILY_TARGETS = ["Famille", "Pour tous", "Enfants"]


def _query_model(db, Model, type_tags: List[str], free_only: bool, eco_only: bool, family_only: bool, limit: int):
    q = db.query(Model)

    if type_tags:
        values = []
        for tag in type_tags:
            values.extend(TYPE_TAG_MAP.get(tag, []))
        if values:
            q = q.filter(Model.type_evenement.in_(values))

    if free_only:
        q = q.filter(Model.free_flag == True)  # noqa: E712

    if eco_only:
        q = q.filter(Model.eco_flag == True)  # noqa: E712

    if family_only:
        q = q.filter(Model.public_cible.in_(FAMILY_TARGETS))

    # Prioritize higher sustainability_score; nulls go last
    q = q.order_by(Model.sustainability_score.desc().nullslast())

    return q.limit(limit).all()


def _serialize(item, source: str):
    return {
        "id": item.id,
        "source": source,  # "festival" or "public_event"
        "title": getattr(item, "titre", None),
        "title_en": getattr(item, "titre_en", None),
        "description": getattr(item, "description", None),
        "type_evenement": getattr(item, "type_evenement", None),
        "public_cible": getattr(item, "public_cible", None),
        "date_debut": getattr(item, "date_debut", None),
        "date_fin": getattr(item, "date_fin", None),
        "arrondissement": getattr(item, "arrondissement", None),
        "free_flag": getattr(item, "free_flag", None),
        "eco_flag": getattr(item, "eco_flag", None),
        "sustainability_score": getattr(item, "sustainability_score", None),
        "badge": getattr(item, "badge", None),
        "lat": getattr(item, "lat", None),
        "long": getattr(item, "long", None),
    }


@router.get("")
def get_recommendations(
    tags: Optional[str] = Query(None, description="Comma-separated type tags, e.g. music,art"),
    free_only: bool = Query(False),
    eco_only: bool = Query(False),
    family_only: bool = Query(False),
    limit: int = Query(20, ge=1, le=100),
):
    type_tags = [t.strip() for t in tags.split(",")] if tags else []

    db = SessionLocal()
    try:
        # Split the quota evenly between the two tables so neither dominates the results
        per_table_limit = max(limit // 2, 5)

        festivals = _query_model(db, Festival, type_tags, free_only, eco_only, family_only, per_table_limit)
        events = _query_model(db, PublicEvent, type_tags, free_only, eco_only, family_only, per_table_limit)

        results = [_serialize(f, "festival") for f in festivals] + \
                  [_serialize(e, "public_event") for e in events]

        # Shuffle so festivals and public events are interleaved, not grouped
        random.shuffle(results)
        return {"count": len(results), "results": results[:limit]}
    finally:
        db.close()


@router.get("/tags")
def get_available_tags():
    """Return the list of available tags so the frontend doesn't need hardcoded values."""
    return {
        "type_tags": list(TYPE_TAG_MAP.keys()),
        "family_targets": FAMILY_TARGETS,
    }

