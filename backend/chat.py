from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, date
from zoneinfo import ZoneInfo
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

# Montreal timezone, used so the chatbot can resolve relative time
# expressions like "this weekend" or "next week" against the real
# current date instead of guessing or claiming it has no date access.
MONTREAL_TZ = ZoneInfo("America/Montreal")


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
    the other table's results.

    Deliberately does NOT filter by date -- expired events are still
    returned so the model can recommend them with an "already ended"
    annotation (or, for recurring festivals, a "happens again next year"
    note) instead of silently hiding them. Status is computed per event in
    format_events_for_prompt and handed to the model as a fact rather than
    left for the model to infer from raw dates.
    """
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


def _event_status(e, today):
    """Return 'ended', 'ongoing', 'upcoming', or 'unknown' for one event,
    computed from date_debut/date_fin so the model is handed a fact instead
    of having to infer it from raw date strings itself."""
    fin = debut = None
    try:
        if e.date_fin:
            fin = date.fromisoformat(e.date_fin)
    except ValueError:
        pass
    try:
        if e.date_debut:
            debut = date.fromisoformat(e.date_debut)
    except ValueError:
        pass

    if fin is not None:
        if fin < today:
            return "ended"
        return "ongoing" if (debut is not None and debut <= today) else "upcoming"
    if debut is not None:
        return "upcoming" if debut > today else "ongoing"
    return "unknown"


def format_events_for_prompt(events):
    today = date.today()
    lines = []
    for e in events:
        status = _event_status(e, today)
        # Curated festivals (Festival table) are known annual/recurring
        # events by design of the curated list; public events pulled from
        # city open data are one-time occurrences. This distinction drives
        # which annotation template the model should use (see
        # date_instruction below) -- it is NOT inferred from outside
        # knowledge about any specific event.
        recurring = "yes" if isinstance(e, Festival) else "no"
        lines.append(
            f"- id={e.id} | {e.titre} | {e.date_debut} to {e.date_fin} | "
            f"status={status} | recurring={recurring} | "
            f"{e.arrondissement or e.emplacement or 'location unknown'} | "
            f"{e.type_evenement or 'type unknown'} | cost={e.cout or 'unknown'}"
        )
    return "\n".join(lines)


def get_date_context() -> str:
    """Return today's date in Montreal time as a human-readable string,
    so the model can calculate ranges like "this weekend" or "next week"
    instead of saying it has no access to the current date."""
    now = datetime.now(MONTREAL_TZ)
    return f"Today's date is {now.strftime('%Y-%m-%d')} ({now.strftime('%A')}), Montreal time."


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

    # Language rule: detect the language of the user's message and reply in
    # kind. Only English and French are supported (matches the site's
    # [lang] locales). This intentionally overrides req.lang (the current
    # UI locale) — req.lang is still useful for other templated strings,
    # but the reply language always follows what the user actually typed.
    lang_instruction = (
        "Detect the language of the user's message below and reply entirely "
        "in that language. If the message is in French, reply entirely in "
        "French. If the message is in English, or in any other language, "
        "reply entirely in English. Do not mix languages within a single "
        "reply, and do not mention that you are detecting the language."
    )

    # Date/status rule: give Claude today's actual date for resolving
    # relative time expressions, plus the precomputed status/recurring
    # facts attached to each event below (see format_events_for_prompt) so
    # it never has to guess expiry from raw dates. Expired events are NOT
    # filtered out upstream -- they must still be recommended, just clearly
    # annotated, with different phrasing depending on whether the event is
    # a recurring festival or a one-time public event.
    date_instruction = (
        f"{get_date_context()} Each event below includes precomputed "
        "status=ended|ongoing|upcoming|unknown and recurring=yes|no fields "
        "-- treat these as ground truth rather than recalculating status "
        "yourself from the raw dates.\n\n"
        "Do not omit or hide an event just because it has already ended. "
        "For every event you recommend, work its status into your answer "
        "naturally, using one of these cases:\n"
        "- recurring=no and status=ended: say plainly that this event has "
        "already ended.\n"
        "- recurring=no and status=ongoing or upcoming: recommend it "
        "normally, with no expiry caveat needed.\n"
        "- recurring=yes and status=ended: say it has already ended for "
        "this year, mention that it recurs annually around the same time "
        "of year (state that period in your own words based on this "
        "event's own date_debut/date_fin -- e.g. \"mid-June\" -- do not "
        "invent a period from outside knowledge), and suggest the person "
        "keep an eye out for next year's announcement. (For reference, "
        "the intended meaning in Chinese is: 這個活動目前已經過期，但每年"
        "＿＿都會舉行，建議可以密切留意相關訊息 -- phrase this naturally in "
        "whatever language you are replying in; do not translate it "
        "literally.)\n"
        "- recurring=yes and status=ongoing or upcoming: mention that it "
        "takes place during roughly that same period every year (again "
        "stated from this event's own dates). (Reference meaning in "
        "Chinese: 這個活動會在固定＿＿時間舉行.)\n"
        "- status=unknown: skip the status/period commentary for that "
        "event rather than guessing.\n\n"
        "Separately, when the user's message itself references a relative "
        "time period (e.g. \"this weekend\", \"next week\", \"today\"), "
        "calculate the real date range from today's date above -- do not "
        "say you lack access to the current date."
    )

    system_prompt = (
            f"{lang_instruction}\n\n"
            f"{date_instruction}\n\n"
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
