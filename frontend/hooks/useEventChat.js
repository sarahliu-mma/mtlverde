"use client";
import { useState, useRef, useEffect } from "react";
import { API_BASE } from "@/lib/api";

// Matches "[id: EVENT_ID]" tags Claude inserts to reference a specific event.
const ID_TAG_RE = /\[id:\s*([\w-]+)\]/g;

// Turns "**bold**" markdown into real <strong> elements.
export function renderBold(text, keyPrefix) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, idx) =>
    idx % 2 === 1 ? <strong key={`${keyPrefix}-b-${idx}`}>{part}</strong> : part
  );
}

// Shared chat state + send logic used by both the floating ChatWidget
// and the full-page RecommendationsClient, so both stay in sync.
export function useEventChat({ lang, errorText }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (overrideText) => {
    const userMsg = overrideText ?? input;
    if (!userMsg.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, lang }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply, events: data.events || [] },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: errorText, events: [] },
      ]);
    }
    setLoading(false);
  };

  return { messages, input, setInput, loading, sendMessage, bottomRef };
}

// Renders one chat message. User messages are a simple bubble; assistant
// messages are split on [id: EVENT_ID] tags so referenced events render as
// real EventCards instead of raw text tags.
export function renderMessageContent(message, lang, dict, isSaved, toggle, EventCard) {
  if (message.role === "user") {
    return (
      <div className="text-sm p-3 rounded-lg max-w-[80%] ml-auto bg-green-100">
        {message.text}
      </div>
    );
  }

  const eventsById = {};
  (message.events || []).forEach((e) => {
    eventsById[String(e.id)] = e;
  });

  const segments = message.text.split(ID_TAG_RE);
  const nodes = [];

  segments.forEach((seg, i) => {
    if (i % 2 === 1) {
      const event = eventsById[seg];
      if (event) {
        nodes.push(
          <EventCard
            key={`card-${i}`}
            event={event}
            lang={lang}
            dict={dict}
            saved={isSaved(event.id)}
            onToggleSave={() => toggle(event.id)}
          />
        );
      }
      return;
    }
    const trimmed = seg.trim();
    if (!trimmed) return;
    nodes.push(
      <div
        key={`text-${i}`}
        className="text-sm p-3 rounded-lg bg-gray-100 leading-relaxed whitespace-pre-wrap"
      >
        {renderBold(trimmed, `t${i}`)}
      </div>
    );
  });

  return <div className="space-y-3 max-w-[90%] mr-auto">{nodes}</div>;
}
