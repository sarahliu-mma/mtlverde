import json
import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import get_db, engine, Base
from models import Festival

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://mtlverde0.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/events")
def get_events(db: Session = Depends(get_db)):
    events = db.query(Festival).all()
    return events

@app.get("/events/public")
def get_public_events():
    data_path = os.path.join(os.path.dirname(__file__), "public_events_montreal.json")
    with open(data_path, "r", encoding="utf-8") as f:
        events = json.load(f)
    return events

