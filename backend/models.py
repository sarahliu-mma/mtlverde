from sqlalchemy import Column, String, Float
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
    url_fiche = Column(String, nullable=True)
    description = Column(String, nullable=True)
    date_debut = Column(String, nullable=True)
    date_fin = Column(String, nullable=True)
    type_evenement = Column(String, nullable=True)
    public_cible = Column(String, nullable=True)
    emplacement = Column(String, nullable=True)
    cout = Column(String, nullable=True)
    arrondissement = Column(String, nullable=True)
    adresse_principale = Column(String, nullable=True)
    lat = Column(Float, nullable=True)
    long = Column(Float, nullable=True)


class Festival(EventFields, Base):
    """Curated festivals, served at /events."""

    __tablename__ = "festivals"


class PublicEvent(EventFields, Base):
    """Ville de Montréal open-data events, served at /events/public."""

    __tablename__ = "public_events"
