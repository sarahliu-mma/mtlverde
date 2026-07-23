"use client";
import { useState, useRef, useEffect } from "react";
import { API_BASE } from "@/lib/api";

// Matches "[id: EVENT_ID]" tags Claude inserts to reference a specific event.
const ID_TAG_RE = /\[id:\s*([\w-]+)\]/g;

// Turns "**bold**" markdown into an array of plain strings and {bold: true}
// fragments. Caller decides how to render each piece (no hardcoded styles).
export function parseBoldFragments(text) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, idx) => ({ text: part, bold: idx % 2 === 1 }));
}

// Splits an assistant message into an ordered list of segments:
// { type: "text", text } or { type: "event", event }.
// Style-agnostic — each component renders these however fits its own design.
export function parseMessageSegments(message) {
  const eventsById = {};
  (message.events || []).forEach((e) => {
    eventsById[String(e.id)] = e;
  });

  const rawSegments = message.text.split(ID_TAG_RE);
  const segments = [];

  rawSegments.forEach((seg, i) => {
    if (i % 2 === 1) {
      const event = eventsById[seg];
      if (event) segments.push({ type: "event", event });
      return;
    }
    const trimmed = seg.trim();
    if (trimmed) segments.push({ type: "text", text: trimmed });
  });

  return segments;
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
