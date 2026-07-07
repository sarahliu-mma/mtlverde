from sqlalchemy import Column, String, Float
from database import Base


class Festival(Base):
    __tablename__ = "festivals"

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
