"use client";
import { useState, useRef, useEffect } from "react";
import Header from "../Header";
import EventCard from "../EventCard";
import { useBookmarks } from "@/lib/bookmarks";
import { API_BASE } from "@/lib/api";

// Matches "[id: EVENT_ID]" tags Claude inserts to reference a specific event.
const ID_TAG_RE = /\[id:\s*([\w-]+)\]/g;

// Turns "**bold**" markdown into real <strong> elements.
function renderBold(text, keyPrefix) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, idx) =>
    idx % 2 === 1 ? <strong key={`${keyPrefix}-b-${idx}`}>{part}</strong> : part
  );
}

// Renders one chat message. User messages are a simple bubble; assistant
// messages are split on [id: EVENT_ID] tags so referenced events render as
// real EventCards instead of raw text tags.
function renderMessageContent(message, lang, dict, isSaved, toggle) {
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

export default function RecommendationsClient({ dict, lang }) {
  const r = dict.recommendations;
  const c = dict.chatWidget;
  const { isSaved, toggle } = useBookmarks();

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
        { role: "assistant", text: c.error, events: [] },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header dict={dict} lang={lang} subtitle={r.heading} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 flex flex-col">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{r.heading}</h1>
        <p className="text-gray-600 mb-6 leading-relaxed">{r.intro}</p>

        <div className="flex-1 bg-white rounded-xl shadow border flex flex-col min-h-[50vh]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">{r.chatEmptyHint}</p>
                <div className="flex flex-wrap gap-2">
                  {c.suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => sendMessage(q)}
                      className="text-sm px-3 py-1.5 rounded-full border border-gray-300 text-gray-700 bg-white hover:border-green-500 hover:text-green-700 transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i}>
                {renderMessageContent(m, lang, dict, isSaved, toggle)}
              </div>
            ))}

            {loading && (
              <div className="text-sm text-gray-400">{c.thinking}</div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t flex gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={c.placeholder}
            />
            <button
              onClick={() => sendMessage()}
              className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition"
            >
              {c.send}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
