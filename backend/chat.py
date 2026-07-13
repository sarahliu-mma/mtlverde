from fastapi import APIRouter
from pydantic import BaseModel
import os
import anthropic

router = APIRouter()
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=500,
        system="You are the event recommendation assistant for MTLVerde, helping users discover festivals and events in Montreal.",
        messages=[{"role": "user", "content": req.message}]
    )
    reply_text = response.content[0].text
    return ChatResponse(reply=reply_text)
