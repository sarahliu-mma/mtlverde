"use client";
// frontend/app/[lang]/sustainability/SustainabilityRanking.js
import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/api";
import { eventTitle, tField } from "../eventData";

const PINE  = "#1a2e1a";
const MOSS  = "#3d5a3e";
const SAGE  = "#7a9e7e";
const STONE = "#c8b89a";
const CREAM = "#f5f0e8";
const WHITE = "#ffffff";

const BADGE_KEY = {
  "Green Leader": "greenLeader",
  "Eco-Friendly": "ecoFriendly",
  "Getting There": "gettingThere",
};

const BADGE_STYLE = {
  "Green Leader": { bg: "#d4e8d4", color: MOSS  },
  "Eco-Friendly": { bg: "#e8f0e4", color: "#4a7a4a" },
  "Getting There": { bg: "#f0e8dc", color: "#7a5a2a" },
};

const COMPONENTS = [
  { key: "transit_access", max: 45, labelKey: "transitLabel", fallback: "Transit access" },
  { key: "walkin_access",  max: 35, labelKey: "walkinLabel",  fallback: "Walk-in access" },
  { key: "outdoor_green",  max: 20, labelKey: "outdoorLabel", fallback: "Outdoor venue"  },
];

const PAGE_SIZE = 50;

export default function SustainabilityRanking({ dict, lang }) {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [openId, setOpenId]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/events/all`)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        const scored = (Array.isArray(data) ? data : []).filter(
          e => typeof e.sustainability_score === "number"
        );
        scored.sort((a, b) => b.sustainability_score - a.sustainability_score);
        setEvents(scored);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const shown = useMemo(() => events.slice(0, visible), [events, visible]);
  const b = dict.badge ?? {};
  const s = dict.sustainability ?? {};

  if (loading) return <p style={{ color: "#bbb", marginTop: 24, fontSize: 14 }}>{s.rankingLoading ?? "Loading ranking…"}</p>;
  if (error)   return <p style={{ color: "#bbb", marginTop: 24, fontSize: 14 }}>{s.rankingError ?? "Couldn't load events right now."}</p>;
  if (events.length === 0) return <p style={{ color: "#bbb", marginTop: 24, fontSize: 14 }}>{s.rankingEmpty ?? "No scored events yet."}</p>;

  return (
    <div style={{ marginTop: 8 }}>
      <ol style={{ display: "grid", gap: 10, listStyle: "none", padding: 0, margin: 0 }}>
        {shown.map((event, i) => {
          const open       = openId === event.id;
          const badgeName  = b[BADGE_KEY[event.badge]] ?? event.badge;
          const badgeStyle = BADGE_STYLE[event.badge] ?? { bg: "#eee", color: "#666" };
          const breakdown  = event.score_breakdown || {};

          return (
            <li key={event.id} style={{ background: WHITE, borderRadius: 18, overflow: "hidden", border: "1px solid rgba(0,0,0,0.06)" }}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : event.id)}
                aria-expanded={open}
                style={{ width: "100%", textAlign: "left", padding: "18px 22px", display: "flex", alignItems: "center", gap: 16, background: "none", border: "none", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = CREAM}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                {/* Rank */}
                <span style={{ fontSize: 12, fontFamily: "monospace", color: "#ccc", width: 28, flexShrink: 0, textAlign: "right" }}>{i + 1}</span>

                {/* Title + badges */}
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 700, fontSize: 14, color: PINE, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {eventTitle(event, lang)}
                  </span>
                  <span style={{ display: "block", fontSize: 12, color: "#aaa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                    {event.arrondissement}
                  </span>
                  <span style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {event.type_evenement && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#f3e8ff", color: "#6b21a8" }}>
                        {tField("type_evenement", event.type_evenement, lang)}
                      </span>
                    )}
                    {event.public_cible && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#fce7f3", color: "#9d174d" }}>
                        {tField("public_cible", event.public_cible, lang)}
                      </span>
                    )}
                    {event.cout && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#e8f0e4", color: MOSS }}>
                        {tField("cout", event.cout, lang)}
                      </span>
                    )}
                  </span>
                </span>

                {/* Badge + score */}
                <span style={{ flexShrink: 0, textAlign: "right" }}>
                  <span style={{ display: "block", fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 999, background: badgeStyle.bg, color: badgeStyle.color, marginBottom: 5, whiteSpace: "nowrap" }}>
                    {badgeName}
                  </span>
                  <span style={{ display: "block", fontSize: 11, fontFamily: "monospace", color: "#bbb" }}>
                    {event.sustainability_score} / 100
                    {event.wheelchair_metro_accessible ? " (A)" : ""}
                  </span>
                </span>

                {/* Chevron */}
                <span style={{ flexShrink: 0, color: "#ccc", fontSize: 10, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }} aria-hidden="true">
                  {"▼"}
                </span>
              </button>

              {open && (
                <div style={{ padding: "12px 22px 22px", borderTop: `1px solid ${CREAM}` }}>
                  <div style={{ display: "grid", gap: 12, paddingTop: 12 }}>
                    {COMPONENTS.map(c => {
                      const pts = breakdown[c.key] ?? 0;
                      const pct = Math.max(0, Math.min(100, (pts / c.max) * 100));
                      return (
                        <div key={c.key} style={{ display: "grid", gridTemplateColumns: "130px 1fr 56px", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: 12, color: "#777" }}>{s[c.labelKey] ?? c.fallback}</span>
                          <span style={{ height: 6, borderRadius: 999, background: "#e4dfd5", overflow: "hidden", display: "block" }}>
                            <span style={{ display: "block", height: "100%", borderRadius: 999, background: MOSS, width: `${pct}%` }} />
                          </span>
                          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#bbb", textAlign: "right" }}>{pts} / {c.max}</span>
                        </div>
                      );
                    })}
                  </div>
                  {event.wheelchair_note && (
                    <p style={{ fontSize: 12, color: "#aaa", marginTop: 12 }}>(A) {event.wheelchair_note}</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {visible < events.length && (
        <div style={{ marginTop: 28, textAlign: "center" }}>
          <button
            type="button"
            onClick={() => setVisible(v => v + PAGE_SIZE)}
            style={{ fontSize: 13, fontWeight: 800, color: MOSS, border: `1.5px solid ${MOSS}`, borderRadius: 999, padding: "11px 28px", background: "transparent", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = MOSS; e.currentTarget.style.color = WHITE; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = MOSS; }}
          >
            {(s.rankingLoadMore ?? "Show {count} more").replace("{count}", events.length - visible)}
          </button>
        </div>
      )}
    </div>
  );
}
