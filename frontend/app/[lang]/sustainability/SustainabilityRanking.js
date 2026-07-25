"use client";
// frontend/app/[lang]/sustainability/SustainabilityRanking.js
import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/api";
import { eventTitle, tField } from "../eventData";

const PINE  = "#1a2e1a";
const MOSS  = "#3d5a3e";
const SAGE  = "#7a9e7e";
const CREAM = "#f5f0e8";
const WHITE = "#ffffff";

const BADGE_KEY = {
  "Green Leader": "greenLeader",
  "Eco-Friendly": "ecoFriendly",
  "Getting There": "gettingThere",
};

const BADGE_STYLE = {
  "Green Leader":  { bg: "#d4e8d4", color: MOSS        },
  "Eco-Friendly":  { bg: "#e8f0e4", color: "#4a7a4a"   },
  "Getting There": { bg: "#f0e8dc", color: "#7a5a2a"   },
};

const BADGE_LEAVES = {
  "Green Leader":  3,
  "Eco-Friendly":  2,
  "Getting There": 1,
};

const COMPONENTS = [
  { key: "transit_access", max: 45, labelKey: "transitLabel", fallback: "Transit access" },
  { key: "walkin_access",  max: 35, labelKey: "walkinLabel",  fallback: "Walk-in access" },
  { key: "outdoor_green",  max: 20, labelKey: "outdoorLabel", fallback: "Outdoor venue"  },
];

const PAGE_SIZE = 50;

function btnEnter(e) {
  e.currentTarget.style.background = MOSS;
  e.currentTarget.style.color = WHITE;
}
function btnLeave(e) {
  e.currentTarget.style.background = "transparent";
  e.currentTarget.style.color = MOSS;
}

export default function SustainabilityRanking({ dict, lang }) {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [openId, setOpenId]   = useState(null);

  useEffect(function() {
    let cancelled = false;
    fetch(`${API_BASE}/events/all`)
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (cancelled) return;
        const scored = (Array.isArray(data) ? data : []).filter(
          function(e) { return typeof e.sustainability_score === "number"; }
        );
        scored.sort(function(a, b) { return b.sustainability_score - a.sustainability_score; });
        setEvents(scored);
        setLoading(false);
      })
      .catch(function() {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return function() { cancelled = true; };
  }, []);

  const shown = useMemo(function() { return events.slice(0, visible); }, [events, visible]);

  const openEvent = useMemo(function() {
    if (!openId) return null;
    return events.find(function(e) { return e.id === openId; }) || null;
  }, [openId, events]);

  const b = dict.badge ?? {};
  const s = dict.sustainability ?? {};
  const fr = lang === "fr";

  if (loading) return <p style={{ color: "#bbb", marginTop: 24, fontSize: 14 }}>{s.rankingLoading ?? "Loading ranking…"}</p>;
  if (error)   return <p style={{ color: "#bbb", marginTop: 24, fontSize: 14 }}>{s.rankingError ?? "Couldn't load events right now."}</p>;
  if (events.length === 0) return <p style={{ color: "#bbb", marginTop: 24, fontSize: 14 }}>{s.rankingEmpty ?? "No scored events yet."}</p>;

  return (
    <div style={{ marginTop: 8 }}>
      <style>{`
        .sr-scroll::-webkit-scrollbar { height: 5px; }
        .sr-scroll::-webkit-scrollbar-track { background: transparent; }
        .sr-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 3px; }
        .sr-card { transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s; }
        .sr-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.10); }
        .sr-card-active { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(26,46,26,0.18) !important; }
      `}</style>

      {/* ── Horizontal scroll track ── */}
      <div className="sr-scroll" style={{ overflowX: "auto", paddingBottom: 12 }}>
        <div style={{ display: "flex", gap: 12, paddingBottom: 4, width: "max-content", alignItems: "stretch" }}>
          {shown.map(function(event, i) {
            const isOpen       = openId === event.id;
            const badgeName    = b[BADGE_KEY[event.badge]] ?? event.badge;
            const badgeStyle   = BADGE_STYLE[event.badge] ?? { bg: "#eee", color: "#666" };

            const leafCount = BADGE_LEAVES[event.badge] || 1;

            return (
              <button
                key={event.id}
                type="button"
                className={"sr-card" + (isOpen ? " sr-card-active" : "")}
                onClick={function() { setOpenId(isOpen ? null : event.id); }}
                aria-expanded={isOpen}
                style={{
                  width: 200,
                  flexShrink: 0,
                  background: isOpen ? PINE : WHITE,
                  borderRadius: 18,
                  border: isOpen ? "2px solid " + PINE : "1.5px solid rgba(0,0,0,0.07)",
                  padding: "18px 16px",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                }}
              >
                {/* Rank + badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: isOpen ? "rgba(255,255,255,0.22)" : "#ddd" }}>
                    #{i + 1}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 800, padding: "3px 9px", borderRadius: 999,
                    background: isOpen ? "rgba(255,255,255,0.12)" : badgeStyle.bg,
                    color: isOpen ? "rgba(255,255,255,0.75)" : badgeStyle.color,
                    letterSpacing: "0.5px",
                  }}>
                    {badgeName}
                  </span>
                </div>

                {/* Leaf icons */}
                <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
                  {Array.from({ length: leafCount }).map(function(_, li) {
                    return (
                      <svg key={li} width="13" height="13" viewBox="0 0 24 24" fill={isOpen ? SAGE : badgeStyle.color} stroke="none" aria-hidden="true">
                        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
                      </svg>
                    );
                  })}
                  {Array.from({ length: 3 - leafCount }).map(function(_, li) {
                    return (
                      <svg key={"e" + li} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isOpen ? "rgba(255,255,255,0.18)" : "#ddd"} strokeWidth="1.5" aria-hidden="true">
                        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
                      </svg>
                    );
                  })}
                </div>

                {/* Title */}
                <span style={{
                  display: "block", fontWeight: 700, fontSize: 13,
                  color: isOpen ? WHITE : PINE,
                  lineHeight: 1.35, marginBottom: 5,
                  overflow: "hidden", display: "-webkit-box",
                  WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  minHeight: "2.7em",
                }}>
                  {eventTitle(event, lang)}
                </span>

                {/* Borough */}
                <span style={{ display: "block", fontSize: 11, color: isOpen ? "rgba(255,255,255,0.38)" : "#bbb", marginBottom: 18 }}>
                  {event.arrondissement}
                </span>

                {/* Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 16 }}>
                  {event.type_evenement && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: isOpen ? "rgba(255,255,255,0.1)" : "#f3e8ff", color: isOpen ? "rgba(255,255,255,0.6)" : "#6b21a8" }}>
                      {tField("type_evenement", event.type_evenement, lang)}
                    </span>
                  )}
                  {event.cout && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: isOpen ? "rgba(255,255,255,0.1)" : "#e8f0e4", color: isOpen ? "rgba(255,255,255,0.6)" : MOSS }}>
                      {tField("cout", event.cout, lang)}
                    </span>
                  )}
                </div>

                {/* Score */}
                <div style={{ marginTop: "auto", borderTop: "1px solid " + (isOpen ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"), paddingTop: 12 }}>
                  <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-1px", color: isOpen ? WHITE : PINE }}>
                    {event.sustainability_score}
                    <span style={{ fontSize: 12, fontWeight: 400, color: isOpen ? "rgba(255,255,255,0.3)" : "#ccc" }}>/100</span>
                  </span>
                  {event.wheelchair_metro_accessible && (
                    <span style={{ display: "block", fontSize: 9, fontWeight: 700, color: isOpen ? SAGE : MOSS, marginTop: 2, letterSpacing: "0.5px" }}>
                      {fr ? "ACCÈS FAUTEUIL" : "WHEELCHAIR OK"}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Expanded detail panel ── */}
      {openEvent && (
        <div style={{ background: WHITE, borderRadius: 18, padding: "26px 28px", marginTop: 12, marginBottom: 8, border: "1.5px solid rgba(0,0,0,0.07)", position: "relative" }}>
          {/* Close button */}
          <button
            type="button"
            onClick={function() { setOpenId(null); }}
            style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#ccc", lineHeight: 1, padding: 4 }}
            aria-label="Close"
          >
            ×
          </button>

          {/* Header */}
          <div style={{ marginBottom: 20, paddingRight: 32 }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: "#bbb", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4 }}>
              {fr ? "Détail du score" : "Score breakdown"}
            </p>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: PINE, margin: 0, lineHeight: 1.3 }}>
              {eventTitle(openEvent, lang)}
            </h3>
            <p style={{ fontSize: 12, color: "#bbb", marginTop: 3 }}>{openEvent.arrondissement}</p>
          </div>

          {/* Score bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
            {COMPONENTS.map(function(c) {
              const breakdown = openEvent.score_breakdown || {};
              const pts = breakdown[c.key] ?? 0;
              const pct = Math.max(0, Math.min(100, (pts / c.max) * 100));
              return (
                <div key={c.key} style={{ display: "grid", gridTemplateColumns: "140px 1fr 60px", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 12, color: "#666" }}>{s[c.labelKey] ?? c.fallback}</span>
                  <span style={{ height: 6, borderRadius: 999, background: "#e4dfd5", overflow: "hidden", display: "block" }}>
                    <span style={{ display: "block", height: "100%", borderRadius: 999, background: MOSS, width: pct + "%" }} />
                  </span>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "#bbb", textAlign: "right" }}>{pts} / {c.max}</span>
                </div>
              );
            })}
          </div>

          {/* Extra tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
            {openEvent.type_evenement && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#f3e8ff", color: "#6b21a8" }}>
                {tField("type_evenement", openEvent.type_evenement, lang)}
              </span>
            )}
            {openEvent.public_cible && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#fce7f3", color: "#9d174d" }}>
                {tField("public_cible", openEvent.public_cible, lang)}
              </span>
            )}
            {openEvent.cout && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#e8f0e4", color: MOSS }}>
                {tField("cout", openEvent.cout, lang)}
              </span>
            )}
          </div>

          {openEvent.wheelchair_note && (
            <p style={{ fontSize: 12, color: "#aaa", marginTop: 12 }}>(A) {openEvent.wheelchair_note}</p>
          )}
        </div>
      )}

      {/* ── Load more ── */}
      {visible < events.length && (
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button
            type="button"
            onClick={function() { setVisible(function(v) { return v + PAGE_SIZE; }); }}
            onMouseEnter={btnEnter}
            onMouseLeave={btnLeave}
            style={{ fontSize: 13, fontWeight: 800, color: MOSS, border: "1.5px solid " + MOSS, borderRadius: 999, padding: "11px 28px", background: "transparent", cursor: "pointer", transition: "all 0.2s" }}
          >
            {(s.rankingLoadMore ?? "Show {count} more").replace("{count}", String(events.length - visible))}
          </button>
        </div>
      )}
    </div>
  );
}
