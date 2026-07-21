"use client";

// frontend/app/[lang]/sustainability/SustainabilityRanking.js
//
// Ranks every event by sustainability score (highest first) and shows the
// score breakdown per event on click. Interactive, so it's a client component.
// Reuses the same /events/all feed the home map uses; sorting and paging happen
// in the browser (the feed is already loaded once, so no extra backend work).

import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/api";
import { eventTitle, tField } from "../eventData";

// Map the English badge value on the event to a dictionary key (name is
// translated; the leaf icon comes straight from the event).
const BADGE_KEY = {
  "Green Leader": "greenLeader",
  "Eco-Friendly": "ecoFriendly",
  "Getting There": "gettingThere",
};

// Max points per component, so each bar fills relative to its own ceiling.
const COMPONENTS = [
  { key: "transit_access", max: 45, labelKey: "transitLabel", fallback: "Transit access" },
  { key: "walkin_access", max: 35, labelKey: "walkinLabel", fallback: "Walk-in access" },
  { key: "outdoor_green", max: 20, labelKey: "outdoorLabel", fallback: "Outdoor venue" },
];

const PAGE_SIZE = 50;

export default function SustainabilityRanking({ dict, lang }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/events/all`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        // Keep only scored events, then sort by score descending (nulls out).
        const scored = (Array.isArray(data) ? data : []).filter(
          (e) => typeof e.sustainability_score === "number"
        );
        scored.sort((a, b) => b.sustainability_score - a.sustainability_score);
        setEvents(scored);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const shown = useMemo(() => events.slice(0, visible), [events, visible]);
  const b = dict.badge ?? {};
  const s = dict.sustainability ?? {};

  if (loading) return <p className="text-gray-500 mt-6">{s.rankingLoading ?? "Loading ranking…"}</p>;
  if (error) return <p className="text-gray-500 mt-6">{s.rankingError ?? "Couldn't load events right now."}</p>;
  if (events.length === 0) return <p className="text-gray-500 mt-6">{s.rankingEmpty ?? "No scored events yet."}</p>;

  return (
    <div className="mt-6">
      <ol className="grid gap-3">
        {shown.map((event, i) => {
          const rank = i + 1;
          const open = openId === event.id;
          const badgeName = b[BADGE_KEY[event.badge]] ?? event.badge;
          const breakdown = event.score_breakdown || {};
          return (
            <li key={event.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : event.id)}
                aria-expanded={open}
                className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition"
              >
                <span className="text-sm font-mono text-gray-400 w-8 shrink-0">{rank}</span>
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold text-gray-800 truncate">
                    {eventTitle(event, lang)}
                  </span>
                  <span className="block text-sm text-gray-500 truncate">
                    {event.arrondissement}
                  </span>
                  <span className="flex flex-wrap gap-1.5 mt-1.5">
                    {event.type_evenement && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        {tField("type_evenement", event.type_evenement, lang)}
                      </span>
                    )}
                    {event.public_cible && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                        {tField("public_cible", event.public_cible, lang)}
                      </span>
                    )}
                    {event.cout && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {tField("cout", event.cout, lang)}
                      </span>
                    )}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block whitespace-nowrap">
                    {event.badge_icon}{" "}
                    <span className="text-sm font-semibold text-gray-700">{badgeName}</span>
                  </span>
                  <span className="block text-xs font-mono text-gray-400">
                    {event.sustainability_score} / 100
                    {event.wheelchair_metro_accessible ? "  \u267F" : ""}
                  </span>
                </span>
                <span
                  className={`shrink-0 text-gray-400 text-xs transition-transform ${open ? "rotate-180" : ""}`}
                  aria-hidden="true"
                >
                  {"\u25BC"}
                </span>
              </button>

              {open && (
                <div className="px-5 pb-5 pt-1 border-t border-gray-100">
                  <div className="grid gap-2.5 pt-3">
                    {COMPONENTS.map((c) => {
                      const pts = breakdown[c.key] ?? 0;
                      const pct = Math.max(0, Math.min(100, (pts / c.max) * 100));
                      return (
                        <div key={c.key} className="grid grid-cols-[110px_1fr_54px] items-center gap-3">
                          <span className="text-sm text-gray-600">{s[c.labelKey] ?? c.fallback}</span>
                          <span className="h-2 rounded-full bg-gray-100 overflow-hidden">
                            <span
                              className="block h-full bg-green-600 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </span>
                          <span className="text-xs font-mono text-gray-500 text-right">
                            {pts} / {c.max}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {event.wheelchair_note && (
                    <p className="text-xs text-gray-500 mt-3">{"\u267F"} {event.wheelchair_note}</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {visible < events.length && (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="text-sm font-semibold text-green-700 border border-green-300 rounded-lg px-5 py-2 hover:bg-green-50 transition"
          >
            {(s.rankingLoadMore ?? "Show more").replace("{count}", events.length - visible)}
          </button>
        </div>
      )}
    </div>
  );
}
