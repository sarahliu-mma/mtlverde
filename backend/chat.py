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

MAX_EVENTS_IN_CONTEXT = 20
STOPWORDS = {
    "the", "a", "an", "is", "are", "in", "on", "at", "for", "to", "of",
    "and", "what", "when", "where", "happening", "this", "weekend",
    "find", "me", "show", "i", "want", "any", "there", "some",
}


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


def extract_keywords(message: str):
    words = re.findall(r"[\w']+", message.lower())
    return [w for w in words if w not in STOPWORDS and len(w) > 1]


def search_events(db: Session, keywords: list, limit: int = MAX_EVENTS_IN_CONTEXT):
    if not keywords:
        return []

    def build_filter(model):
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

    festivals = (
        db.query(Festival)
        .filter(build_filter(Festival))
        .limit(limit)
        .all()
    )

    remaining = limit - len(festivals)
    publics = []
    if remaining > 0:
        publics = (
            db.query(PublicEvent)
            .filter(build_filter(PublicEvent))
            .limit(remaining)
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

    system_prompt = (
        "You are the event recommendation assistant for MTLVerde, helping users "
        "discover festivals and events in Montreal. Use ONLY the events listed "
        "below to make recommendations. If none of the listed events fit the "
        "user's request, say so honestly instead of inventing events. When you "
        "recommend a specific event, include its id in the format [id: EVENT_ID] "
        "so the app can render an event card.\n\n"
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
