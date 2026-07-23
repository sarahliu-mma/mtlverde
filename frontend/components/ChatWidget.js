"use client";
import { useState } from "react";
import EventCard from "./EventCard";
import { useBookmarks } from "@/lib/bookmarks";
import { useEventChat, parseMessageSegments, parseBoldFragments } from "@/hooks/useEventChat";

const PINE  = "#1a2e1a";
const MOSS  = "#3d5a3e";
const SAGE  = "#7a9e7e";
const CREAM = "#f5f0e8";
const DARK  = "#0f1a0f";
const WHITE = "#ffffff";

function ChatIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SAGE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

// Renders one bubble of assistant text, respecting the widget's pine/cream
// theme (matches the styling Chloee set up for user bubbles below).
function AssistantTextBubble({ text }) {
  const fragments = parseBoldFragments(text);
  return (
    <div style={{
      maxWidth: "80%",
      padding: "10px 14px",
      borderRadius: "18px 18px 18px 4px",
      background: WHITE,
      color: DARK,
      fontSize: 13,
      lineHeight: 1.6,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      border: "1px solid rgba(0,0,0,0.05)",
      whiteSpace: "pre-wrap",
    }}>
      {fragments.map((f, i) => (f.bold ? <strong key={i}>{f.text}</strong> : <span key={i}>{f.text}</span>))}
    </div>
  );
}

export default function ChatWidget({ lang, dict }) {
  const c = dict.chatWidget;
  const { isSaved, toggle } = useBookmarks();
  const [open, setOpen] = useState(false);

  const { messages, input, setInput, loading, sendMessage, bottomRef } =
    useEventChat({ lang, errorText: c.error });

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, fontFamily: "'DM Sans','Inter',sans-serif" }}>

      {open ? (
        <div style={{ width: 380, height: 560, background: WHITE, borderRadius: 24, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 64px rgba(10,20,10,0.22), 0 4px 16px rgba(10,20,10,0.12)", border: "1px solid rgba(61,90,62,0.15)" }}>

          {/* Header */}
          <div style={{ background: PINE, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LeafIcon />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: WHITE, margin: 0 }}>{c.title}</p>
                <p style={{ fontSize: 11, color: SAGE, margin: 0, marginTop: 1 }}>
                  {lang === "fr" ? "Assistant communautaire" : "Community assistant"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.7)", fontSize: 16, lineHeight: 1 }}
            >
              {"×"}
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 10, background: CREAM }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", padding: "24px 16px" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(61,90,62,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <LeafIcon />
                </div>
                <p style={{ fontSize: 13, color: "#999", lineHeight: 1.7, margin: "0 0 16px" }}>
                  {c.chatEmptyHint}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                  {c.suggestedQuestions.slice(0, 3).map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => sendMessage(q)}
                      style={{
                        fontSize: 12,
                        padding: "6px 12px",
                        borderRadius: 999,
                        border: `1px solid ${MOSS}`,
                        color: MOSS,
                        background: WHITE,
                        cursor: "pointer",
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => {
              if (m.role === "user") {
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{
                      maxWidth: "80%",
                      padding: "10px 14px",
                      borderRadius: "18px 18px 4px 18px",
                      background: PINE,
                      color: WHITE,
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}>
                      {m.text}
                    </div>
                  </div>
                );
              }

              // Assistant message: split into text bubbles + real EventCards
              // wherever a [id: EVENT_ID] tag was found.
              const segments = parseMessageSegments(m);
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                  {segments.map((seg, j) =>
                    seg.type === "event" ? (
                      <div key={j} style={{ width: "100%" }}>
                        <EventCard
                          event={seg.event}
                          lang={lang}
                          dict={dict}
                          saved={isSaved(seg.event.id)}
                          onToggleSave={() => toggle(seg.event.id)}
                        />
                      </div>
                    ) : (
                      <AssistantTextBubble key={j} text={seg.text} />
                    )
                  )}
                </div>
              );
            })}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ padding: "10px 16px", borderRadius: "18px 18px 18px 4px", background: WHITE, border: "1px solid rgba(0,0,0,0.05)", display: "flex", gap: 5, alignItems: "center" }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: SAGE, display: "block", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "12px 14px", background: WHITE, borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={c.placeholder}
              style={{ flex: 1, border: "1.5px solid rgba(0,0,0,0.1)", borderRadius: 999, padding: "9px 16px", fontSize: 13, outline: "none", background: CREAM, color: DARK, fontFamily: "inherit" }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{ background: input.trim() && !loading ? PINE : "#ccc", color: WHITE, border: "none", borderRadius: "50%", width: 36, height: 36, cursor: input.trim() && !loading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}
              aria-label={c.send}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open MTLVerde chat"
          style={{ width: 56, height: 56, borderRadius: "50%", background: PINE, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(10,20,10,0.3), 0 2px 8px rgba(10,20,10,0.2)", transition: "transform 0.2s, box-shadow 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(10,20,10,0.35)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(10,20,10,0.3), 0 2px 8px rgba(10,20,10,0.2)"; }}
        >
          <ChatIcon size={22} />
        </button>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
