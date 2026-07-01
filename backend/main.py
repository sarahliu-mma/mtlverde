from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/events")
def get_events():
    data_path = os.path.join(os.path.dirname(__file__), "festivals_montreal.json")
    with open(data_path, "r", encoding="utf-8") as f:
        events = json.load(f)
    return events