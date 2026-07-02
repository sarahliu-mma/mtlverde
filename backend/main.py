from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://mtlverde0.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/events")
def get_events():
    data_path = os.path.join(os.path.dirname(__file__), "festivals_montreal.json")
    with open(data_path, "r", encoding="utf-8") as f:
        events = json.load(f)
    return events

@app.get("/events/public")
def get_public_events():
    data_path = os.path.join(os.path.dirname(__file__), "public_events_montreal.json")
    with open(data_path, "r", encoding="utf-8") as f:
        events = json.load(f)
    return events