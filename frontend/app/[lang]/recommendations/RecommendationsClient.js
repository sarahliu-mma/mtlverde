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
        color: "#3a3a3a", lineHeight: 1.75, whiteSpace: "pre-wrap", maxWidth: "88%",
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

const PROMPTS = [
  { icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ), color: MOSS },
  { icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ), color: "#6b5a2a" },
  { icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
      </svg>
    ), color: SAGE },
  { icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="4" r="1.5"/><path d="M9 20l1.5-4.5 2.5 2 2-4.5"/><path d="M11.5 7.5l1.5 4 3.5 1.5-2.5 1"/><path d="M8 12l1.5-4.5"/>
      </svg>
    ), color: "#5a3a7a" },
  { icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19V6l12-3v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="15" r="3"/>
      </svg>
    ), color: "#7a3a3a" },
  { icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ), color: "#3a5a7a" },
];

export default function RecommendationsClient({ dict, lang }) {
  const r = dict.recommendations;
  const c = dict.chatWidget;
  const { isSaved, toggle } = useBookmarks();
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
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

  const fr = lang === "fr";
  const hasMessages = messages.length > 0;

  return (
    <div style={{ fontFamily: "'DM Sans','Inter',sans-serif", minHeight: "100vh", background: CREAM, display: "flex", flexDirection: "column" }}>
      <style>{`
        .chip-btn { transition: all 0.18s; }
        .chip-btn:hover { background: ${PINE} !important; color: ${WHITE} !important; border-color: ${PINE} !important; }
        .chip-btn:hover svg { color: ${WHITE} !important; stroke: ${WHITE} !important; fill: ${WHITE} !important; }
        .send-btn:hover { background: ${MOSS} !important; }
        .chat-input:focus { outline: none; border-color: ${MOSS} !important; box-shadow: 0 0 0 3px rgba(61,90,62,0.12); }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>

      <Header dict={dict} lang={lang} />

      {/* ── HERO — mountain lake / aerial ── */}
      <section style={{ position: "relative", height: "100vh", minHeight: 500, maxHeight: 420, overflow: "hidden", flexShrink: 0 }}>
        <img
          src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1800&q=85"
          alt=""
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,20,10,0.3) 0%, rgba(10,20,10,0.88) 100%)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "0 48px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 44 }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: SAGE, textTransform: "uppercase", marginBottom: 12 }}>
            {fr ? "MTLVERDE · RECOMMANDATIONS" : "MTLVERDE · RECOMMENDATIONS"}
          </p>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 900, color: WHITE, letterSpacing: "-2.5px", lineHeight: 0.95, margin: 0, maxWidth: 700 }}>
            {r.heading}
          </h1>
        </div>
      </section>

      {/* ── MAIN — split layout ── */}
      <main style={{ flex: 1, display: "flex", maxWidth: 1200, width: "100%", margin: "0 auto", padding: "48px 24px 60px", gap: 32, alignItems: "flex-start" }}>

        {/* ── LEFT PANEL — context + prompt cards ── */}
        {!hasMessages && (
          <div style={{ flex: "0 0 300px", display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 32 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "3px", color: SAGE, textTransform: "uppercase", marginBottom: 10 }}>
                {fr ? "ASK MTLVERDE" : "ASK MTLVERDE"}
              </p>
              <p style={{ fontSize: 16, color: "#555", lineHeight: 1.8, marginBottom: 0 }}>{r.intro}</p>
            </div>

            <div style={{ width: "100%", height: 1, background: "#e0d8cc" }} />

            <div>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "2px", color: "#aaa", textTransform: "uppercase", marginBottom: 14 }}>
                {fr ? "ESSAYEZ" : "TRY ASKING"}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {c.suggestedQuestions.map((q, i) => {
                  const p = PROMPTS[i % PROMPTS.length];
                  return (
                    <button
                      key={i}
                      type="button"
                      className="chip-btn"
                      onClick={() => sendMessage(q)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 16px", borderRadius: 14,
                        border: "1.5px solid #ddd", background: WHITE,
                        cursor: "pointer", textAlign: "left", width: "100%",
                        color: DARK,
                      }}
                    >
                      <span style={{ color: p.color, flexShrink: 0, display: "flex" }}>{p.icon}</span>
                      <span style={{ fontSize: 13, lineHeight: 1.4, fontWeight: 500 }}>{q}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Decorative nature strip */}
            <div style={{ borderRadius: 16, overflow: "hidden", height: 140, position: "relative", marginTop: 4 }}>
              <img
                src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80"
                alt=""
                aria-hidden="true"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "rgba(10,20,10,0.5)", display: "flex", alignItems: "flex-end", padding: "14px 16px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.5px", lineHeight: 1.4, margin: 0 }}>
                  {fr ? "Explorez Montréal,\ndurablement." : "Explore Montréal,\nsustainably."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── RIGHT / FULL — chat ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* If messages exist, show compact prompt row at top */}
          {hasMessages && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {c.suggestedQuestions.slice(0, 3).map((q, i) => (
                <button
                  key={i}
                  type="button"
                  className="chip-btn"
                  onClick={() => sendMessage(q)}
                  style={{
                    fontSize: 12, padding: "6px 13px", borderRadius: 999,
                    border: "1.5px solid #ddd", color: "#666", background: WHITE,
                    cursor: "pointer",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div style={{
            background: WHITE,
            borderRadius: 24,
            border: "1.5px solid #e0d8cc",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 6px 32px rgba(0,0,0,0.07)",
            minHeight: hasMessages ? "auto" : "56vh",
          }}>
            {/* Chat header bar */}
            <div style={{ background: PINE, padding: "16px 22px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: MOSS, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={STONE} stroke="none" aria-hidden="true">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: WHITE, margin: 0, letterSpacing: "0.2px" }}>MTLVerde AI</p>
                <p style={{ fontSize: 10, color: SAGE, margin: 0, letterSpacing: "0.5px" }}>
                  {fr ? "Toujours disponible" : "Always available"}
                </p>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
                {[SAGE, STONE, "rgba(255,255,255,0.2)"].map((c2, i) => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: c2 }} />
                ))}
              </div>
            </div>

            {/* Messages area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px", display: "flex", flexDirection: "column", gap: 16, minHeight: hasMessages ? 320 : "auto" }}>
              {!hasMessages && (
                <div style={{ textAlign: "center", padding: "48px 24px 24px" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={MOSS} stroke="none" aria-hidden="true">
                      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: DARK, marginBottom: 6 }}>
                    {fr ? "Bonjour, je suis MTLVerde AI" : "Hi, I'm MTLVerde AI"}
                  </p>
                  <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.7, maxWidth: 340, margin: "0 auto" }}>
                    {fr
                      ? "Posez-moi une question sur les événements, la durabilité ou Montréal."
                      : "Ask me anything about events, sustainability, or what's happening in Montréal."}
                  </p>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i}>
                  {renderMessageContent(m, lang, dict, isSaved, toggle)}
                </div>
              ))}

              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", gap: 4, padding: "10px 14px", background: "#f3f0ea", borderRadius: "4px 18px 18px 18px" }}>
                    {[0, 1, 2].map((d) => (
                      <span key={d} style={{
                        width: 6, height: 6, borderRadius: "50%", background: SAGE,
                        animation: `bounce 1.2s ease-in-out ${d * 0.2}s infinite`,
                        display: "inline-block",
                      }} />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div style={{ padding: "12px 14px", borderTop: "1.5px solid #eee", background: "#fafaf8", display: "flex", gap: 10 }}>
              <input
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={c.placeholder}
                style={{
                  flex: 1, border: "1.5px solid #ddd", borderRadius: 12,
                  padding: "10px 14px", fontSize: 14, color: DARK,
                  background: WHITE, transition: "border-color 0.2s, box-shadow 0.2s",
                }}
              />
              <button
                type="button"
                className="send-btn"
                onClick={() => sendMessage()}
                style={{
                  background: PINE, color: WHITE, border: "none", borderRadius: 12,
                  padding: "10px 22px", fontSize: 13, fontWeight: 800,
                  cursor: "pointer", transition: "background 0.18s", letterSpacing: "0.3px",
                }}
              >
                {c.send}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
