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
        "You are the event recommendation assistant for MTLVerde, helping users "
        "discover festivals and events in Montreal. You must use ONLY the events "
        "listed below to make recommendations. Do NOT use any outside knowledge "
        "about festivals, venues, or events, even ones you are confident exist. "
        "If none of the listed events fit the user's request, say so honestly "
        "and do not suggest anything not in the list. When you recomend a "
        "specific event, include its id in the format [id: EVENT_ID] so the app "
        "can render an event card.\n\n"
        f"Available events matching this query:\n{events_context}"
    )

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=500,
        system=system_prompt,
        messages=[{"role": "user", "content": req.message}],
    )
    reply_text = response.content[0].text
    return ChatResponse(reply=reply_text)
