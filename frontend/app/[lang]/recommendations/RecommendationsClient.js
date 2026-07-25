"use client";
// frontend/app/[lang]/recommendations/RecommendationsClient.js
import { useState, useRef, useEffect } from "react";
import Header from "../Header";
import EventCard from "../EventCard";
import { useBookmarks } from "@/lib/bookmarks";
import { API_BASE } from "@/lib/api";

const PINE  = "#1a2e1a";
const MOSS  = "#3d5a3e";
const SAGE  = "#7a9e7e";
const STONE = "#c8b89a";
const CREAM = "#f5f0e8";
const DARK  = "#0f1a0f";
const WHITE = "#ffffff";

const ID_TAG_RE = /\[id:\s*([\w-]+)\]/g;

function renderBold(text, keyPrefix) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, idx) =>
    idx % 2 === 1 ? <strong key={`${keyPrefix}-b-${idx}`}>{part}</strong> : part
  );
}

function renderMessageContent(message, lang, dict, isSaved, toggle) {
  if (message.role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{
          fontSize: 14, padding: "10px 16px", borderRadius: "18px 18px 4px 18px",
          maxWidth: "78%", background: PINE, color: WHITE, lineHeight: 1.6,
        }}>
          {message.text}
        </div>
      </div>
    );
  }

  const eventsById = {};
  (message.events || []).forEach((e) => { eventsById[String(e.id)] = e; });

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
      <div key={`text-${i}`} style={{
        fontSize: 14, padding: "12px 16px", borderRadius: "4px 18px 18px 18px",
        background: WHITE, border: "1.5px solid #e8e0d4",
        color: "#3a3a3a", lineHeight: 1.75, whiteSpace: "pre-wrap",
        maxWidth: "88%",
      }}>
        {renderBold(trimmed, `t${i}`)}
      </div>
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
      {nodes}
    </div>
  );
}

export default function RecommendationsClient({ dict, lang }) {
  const r = dict.recommendations;
  const c = dict.chatWidget;
  const { isSaved, toggle } = useBookmarks();
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [focused, setFocused]     = useState(false);
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
    <div style={{ fontFamily: "'DM Sans','Inter',sans-serif", minHeight: "100vh", background: CREAM, display: "flex", flexDirection: "column" }}>
      <style>{`
        .chip:hover { background: ${PINE} !important; color: ${WHITE} !important; border-color: ${PINE} !important; }
        .send-btn:hover { background: ${MOSS} !important; }
        .chat-input:focus { outline: none; border-color: ${MOSS} !important; box-shadow: 0 0 0 3px rgba(61,90,62,0.12); }
      `}</style>

      <Header dict={dict} lang={lang} />

      {/* ── HERO STRIP ── */}
      <div style={{ position: "relative", height: 220, overflow: "hidden", flexShrink: 0 }}>
        <img
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=85"
          alt=""
          aria-hidden="true"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 55%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,20,10,0.45) 0%, rgba(10,20,10,0.85) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 48px 32px" }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: SAGE, textTransform: "uppercase", marginBottom: 8 }}>
            {lang === "fr" ? "MTLVERDE · RECOMMANDATIONS" : "MTLVERDE · RECOMMENDATIONS"}
          </p>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, color: WHITE, letterSpacing: "-1.5px", lineHeight: 1, margin: 0 }}>
            {r.heading}
          </h1>
        </div>
      </div>

      {/* ── CHAT AREA ── */}
      <main style={{ flex: 1, maxWidth: 800, width: "100%", margin: "0 auto", padding: "32px 24px 40px", display: "flex", flexDirection: "column" }}>
        <p style={{ fontSize: 15, color: "#666", marginBottom: 24, lineHeight: 1.7 }}>{r.intro}</p>

        {/* Chat container */}
        <div style={{
          flex: 1,
          background: WHITE,
          borderRadius: 24,
          border: "1.5px solid #e0d8cc",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          minHeight: "55vh",
        }}>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.length === 0 && (
              <div>
                <p style={{ fontSize: 13, color: "#bbb", marginBottom: 16 }}>{r.chatEmptyHint}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {c.suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      className="chip"
                      onClick={() => sendMessage(q)}
                      style={{
                        fontSize: 13, padding: "7px 14px", borderRadius: 999,
                        border: "1.5px solid #ccc", color: "#555", background: WHITE,
                        cursor: "pointer", transition: "all 0.18s",
                      }}
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
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0, 1, 2].map((d) => (
                    <span key={d} style={{
                      width: 6, height: 6, borderRadius: "50%", background: SAGE,
                      animation: `bounce 1.2s ease-in-out ${d * 0.2}s infinite`,
                      display: "inline-block",
                    }} />
                  ))}
                </div>
                <style>{`
                  @keyframes bounce {
                    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
                    40% { transform: translateY(-5px); opacity: 1; }
                  }
                `}</style>
                <span style={{ fontSize: 12, color: "#bbb" }}>{c.thinking}</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div style={{
            padding: "14px 16px",
            borderTop: "1.5px solid #eee",
            display: "flex",
            gap: 10,
            background: "#fafaf8",
          }}>
            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={c.placeholder}
              style={{
                flex: 1,
                border: "1.5px solid #ddd",
                borderRadius: 12,
                padding: "10px 14px",
                fontSize: 14,
                color: DARK,
                background: WHITE,
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            />
            <button
              type="button"
              className="send-btn"
              onClick={() => sendMessage()}
              style={{
                background: PINE,
                color: WHITE,
                border: "none",
                borderRadius: 12,
                padding: "10px 22px",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                transition: "background 0.18s",
                letterSpacing: "0.3px",
              }}
            >
              {c.send}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
