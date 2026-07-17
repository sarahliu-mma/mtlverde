from sqlalchemy import Column, String, Float, Boolean, Integer, JSON
from database import Base


class EventFields:
    """Shared columns for the festival and public-event tables.

    Both feeds are normalized to the same shape, so the columns live here and
    each table mixes them in -- keeping the two schemas from drifting apart.
    id is a String PK because festival ids are title slugs ("festival-mural")
    and public event ids are numeric strings ("87905") -- both stored as text.
    """

    id = Column(String, primary_key=True, index=True)
    titre = Column(String, nullable=False)
    titre_en = Column(String, nullable=True)
    url_fiche = Column(String, nullable=True)
    description = Column(String, nullable=True)
    description_en = Column(String, nullable=True)
    date_debut = Column(String, nullable=True)
    date_fin = Column(String, nullable=True)
    type_evenement = Column(String, nullable=True)
    public_cible = Column(String, nullable=True)
    emplacement = Column(String, nullable=True)
    inscription = Column(String, nullable=True)
    cout = Column(String, nullable=True)
    arrondissement = Column(String, nullable=True)
    adresse_principale = Column(String, nullable=True)
    lat = Column(Float, nullable=True)
    long = Column(Float, nullable=True)

    # --- Sustainability scoring (Joohee) ---------------------------------
    # A 0-100 low-carbon-accessibility score plus a 3-tier eco-badge, and
    # wheelchair-by-metro accessibility reported separately from the score.
    # score_breakdown / score_reasons / eco_flag_terms are JSON (dict/list).
    sustainability_score = Column(Float, nullable=True)      # 0-100
    badge = Column(String, nullable=True)                    # "Green Leader" | ...
    badge_icon = Column(String, nullable=True)               # "🌿🌿🌿" | ...
    eco_flag = Column(Boolean, nullable=True)                # organizer-advertised eco practice
    free_flag = Column(Boolean, nullable=True)               # free admission
    score_breakdown = Column(JSON, nullable=True)            # {"transit_access": 45, ...}
    score_reasons = Column(JSON, nullable=True)              # ["Metro 159 m", "Outdoor", ...]
    eco_flag_terms = Column(JSON, nullable=True)             # ["zéro déchet", ...]
    wheelchair_metro_accessible = Column(Boolean, nullable=True)  # accessible metro <=800 m
    wheelchair_metro_m = Column(Integer, nullable=True)          # distance to accessible metro
    wheelchair_metro_gap_m = Column(Integer, nullable=True)      # extra distance vs any metro
    wheelchair_note = Column(String, nullable=True)              # "Accessible metro 384 m"


class Festival(EventFields, Base):
    """Curated festivals, served at /events."""

    __tablename__ = "festivals"


class PublicEvent(EventFields, Base):
    """Ville de Montréal open-data events, served at /events/public."""

    __tablename__ = "public_events"
