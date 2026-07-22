from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_
import os
import re
import anthropic

from database import get_db
from models import Festival, PublicEvent

router = APIRouter()
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

MAX_EVENTS_PER_TABLE = 15
STOPWORDS = {
    "the", "a", "an", "is", "are", "in", "on", "at", "for", "to", "of",
    "and", "what", "when", "where", "happening", "this", "weekend",
    "find", "me", "show", "i", "want", "any", "there", "some",
    "festival", "festivals", "event", "events", "montreal", "happen",
}


class ChatRequest(BaseModel):
    message: str
    lang: str = "en"  # "en" or "fr" — determines the reply language


class ChatResponse(BaseModel):
    reply: str
    events: list[dict] = []


def extract_keywords(message: str):
    words = re.findall(r"[\w']+", message.lower())
    return [w for w in words if w not in STOPWORDS and len(w) > 1]


def build_filter(model, keywords):
    conditions = []
    for kw in keywords:
        pattern = f"%{kw}%"
        conditions.append(
            or_(
                model.titre.ilike(pattern),
                model.description.ilike(pattern),
                model.description_en.ilike(pattern),
                model.type_evenement.ilike(pattern),
                model.arrondissement.ilike(pattern),
                model.emplacement.ilike(pattern),
            )
        )
    return or_(*conditions)


def search_events(db: Session, keywords: list, limit_per_table: int = MAX_EVENTS_PER_TABLE):
    """Keyword-match festivals and public events independently, each with
    its own quota, so a generic keyword matching one table can't crowd out
    the other table's results."""
    if not keywords:
        return []

    festivals = (
        db.query(Festival)
        .filter(build_filter(Festival, keywords))
        .limit(limit_per_table)
        .all()
    )

    publics = (
        db.query(PublicEvent)
        .filter(build_filter(PublicEvent, keywords))
        .limit(limit_per_table)
        .all()
    )

    return list(festivals) + list(publics)


def format_events_for_prompt(events):
    lines = []
    for e in events:
        lines.append(
            f"- id={e.id} | {e.titre} | {e.date_debut} to {e.date_fin} | "
            f"{e.arrondissement or e.emplacement or 'location unknown'} | "
            f"{e.type_evenement or 'type unknown'} | cost={e.cout or 'unknown'}"
        )
    return "\n".join(lines)


# Serializes an event to the same shape EventCard.js expects (matches
# recommendations.py's _serialize), so chat replies can render real cards.
def _serialize_event(item):
    return {
        "id": item.id,
        "titre": getattr(item, "titre", None),
        "titre_en": getattr(item, "titre_en", None),
        "description": getattr(item, "description", None),
        "description_en": getattr(item, "description_en", None),
        "type_evenement": getattr(item, "type_evenement", None),
        "public_cible": getattr(item, "public_cible", None),
        "cout": getattr(item, "cout", None),
        "inscription": getattr(item, "inscription", None),
        "emplacement": getattr(item, "emplacement", None),
        "date_debut": getattr(item, "date_debut", None),
        "date_fin": getattr(item, "date_fin", None),
        "arrondissement": getattr(item, "arrondissement", None),
        "url_fiche": getattr(item, "url_fiche", None),
        "eco_flag": getattr(item, "eco_flag", None),
        "sustainability_score": getattr(item, "sustainability_score", None),
        "badge": getattr(item, "badge", None),
        "badge_icon": getattr(item, "badge_icon", None),
        "wheelchair_metro_accessible": getattr(item, "wheelchair_metro_accessible", None),
        "lat": getattr(item, "lat", None),
        "long": getattr(item, "long", None),
    }


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    keywords = extract_keywords(req.message)
    events = search_events(db, keywords)
    events_context = (
        format_events_for_prompt(events)
        if events
        else "No matching events found in the database for these keywords."
    )

    lang_instruction = (
        "Always reply in English, regardless of what language the user writes in."
        if req.lang == "en"
        else "Réponds toujours en français, peu importe la langue utilisée par l'utilisateur."
    )

    system_prompt = (
        f"{lang_instruction}\n\n"
        "You are the event recommendation assistant for MTLVerde, a bilingual "
        "website that helps people discover free and low-cost community events "
        "in Montréal. You can help with two kinds of questions:\n\n"
        "1. Questions about MTLVerde itself (what it is, its mission, how "
        "sustainability scoring works, its data source). Use ONLY this "
        "background to answer such questions — do not invent features or "
        "details beyond what's stated here:\n"
        "- What MTLVerde is: Montréal produces thousands of free community "
        "events every year, but they're scattered, hard to find, and often "
        "only in French. MTLVerde brings them together in one free, bilingual "
        "place, so anyone can find something meaningful to do nearby.\n"
        "- What it does: an interactive map and smart filters (by borough, "
        "audience, cost, and sustainability), plus a curated list of "
        "Montréal's iconic festivals. Every event earns an eco-badge for "
        "accessibility, cost, location, and inclusivity.\n"
        "- Data source: built on open data published by the City of Montréal, "
        "complemented by a curated list of iconic festivals.\n"
        "- Vision: to become Montréal's community discovery layer, so no one "
        "feels like a stranger in their own neighbourhood.\n\n"
        "2. Questions asking for event recommendations. You must use ONLY the "
        "events listed below to make recommendations. Do NOT use any outside "
        "knowledge about festivals, venues, or events, even ones you are "
        "confident exist. If none of the listed events fit the user's "
        "request, say so honestly and do not suggest anything not in the "
        "list. When you recommend a specific event, mention its name and a "
        "brief one-line reason it fits, then include its id in the format "
        "[id: EVENT_ID] on its own — the app renders a full card with the "
        "date, location, cost, and description automatically, so do NOT "
        "repeat those details in your text.\n\n"
        "If a question is unrelated to both MTLVerde and Montréal events "
        "(e.g. general trivia), politely say that's outside what you can "
        "help with and redirect to event discovery.\n\n"
        f"Available events matching this query:\n{events_context}"
    )

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=500,
        system=system_prompt,
        messages=[{"role": "user", "content": req.message}],
    )
    reply_text = response.content[0].text
    serialized_events = [_serialize_event(e) for e in events]
    return ChatResponse(reply=reply_text, events=serialized_events)
