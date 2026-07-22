"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Header from "./Header";
import EventCard from "./EventCard";
import MultiSelect from "./MultiSelect";
import { tField } from "./eventData";
import { useBookmarks } from "@/lib/bookmarks";
import { API_BASE } from "@/lib/api";
import ChatWidget from "./ChatWidget";

const Map = dynamic(() => import("./Map"), { ssr: false });

const ALL = "Tous";
const PAGE_SIZE = 24;

export default function HomeClient({ dict, lang, initialEvents = [] }) {
  const [events, setEvents] = useState(initialEvents);
  const [typeFilter, setTypeFilter] = useState([]);
  const [arrFilter, setArrFilter] = useState([]);
  const [audFilter, setAudFilter] = useState([]);
  const [coutFilter, setCoutFilter] = useState(ALL);
  const [empFilter, setEmpFilter] = useState(ALL);
  const [inscFilter, setInscFilter] = useState(ALL);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { isSaved, toggle } = useBookmarks();

  useEffect(() => {
    if (initialEvents.length) return;
    fetch(`${API_BASE}/events/all`)
      .then((res) => res.json())
      .then((data) => setEvents(data));
  }, [initialEvents.length]);

  const options = useMemo(() => {
    const build = (field) =>
      [ALL, ...[...new Set(events.map((e) => e[field]).filter(Boolean))].sort()];
    return {
      type_evenement: build("type_evenement"),
      arrondissement: build("arrondissement"),
      cout: build("cout"),
      emplacement: build("emplacement"),
      public_cible: build("public_cible"),
      inscription: build("inscription"),
    };
  }, [events]);

  const selectFilters = [
    { label: dict.filters.type, field: "type_evenement", value: typeFilter, set: setTypeFilter, multi: true },
    { label: dict.filters.arrondissement, field: "arrondissement", value: arrFilter, set: setArrFilter, multi: true },
    { label: dict.filters.cout, field: "cout", value: coutFilter, set: setCoutFilter },
    { label: dict.filters.lieu, field: "emplacement", value: empFilter, set: setEmpFilter },
    { label: dict.filters.public, field: "public_cible", value: audFilter, set: setAudFilter, multi: true },
    { label: dict.filters.inscription, field: "inscription", value: inscFilter, set: setInscFilter },
  ];

  const filtered = useMemo(() => {
    const multi = [
      ["type_evenement", typeFilter],
      ["arrondissement", arrFilter],
      ["public_cible", audFilter],
    ];
    const single = [
      ["cout", coutFilter],
      ["emplacement", empFilter],
      ["inscription", inscFilter],
    ];
    return events.filter((e) => {
      const selectMatch =
        multi.every(([field, values]) => values.length === 0 || values.includes(e[field])) &&
        single.every(([field, value]) => value === ALL || e[field] === value);
      const startMatch = !startDate || (e.date_debut && e.date_debut >= startDate);
      const endMatch = !endDate || (e.date_fin && e.date_fin <= endDate);
      return selectMatch && startMatch && endMatch;
    });
  }, [events, typeFilter, arrFilter, coutFilter, empFilter, audFilter, inscFilter, startDate, endDate]);

  const filterKey = JSON.stringify([typeFilter, arrFilter, coutFilter, empFilter, audFilter, inscFilter, startDate, endDate]);
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  const visible = filtered.slice(0, visibleCount);

  const t = (en, fr) => lang === "fr" ? fr : en;

  const navItems = [
    { label: t("Events", "Événements"),         href: `/${lang}` },
    { label: t("Sustainability", "Durabilité"),  href: `/${lang}/sustainability`, highlight: true },
    { label: t("Recommendations", "Suggestions"),href: `/${lang}/recommendations` },
    { label: t("Saved", "Sauvegardés"),          href: `/${lang}/saved` },
    { label: t("Mission", "Mission"),            href: `/${lang}/mission` },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top navigation bar ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#1e4d2b",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: 48,
        boxShadow: "0 1px 8px rgba(0,0,0,0.15)",
      }}>
        <div style={{ display: "flex", gap: 4 }}>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                fontSize: 13,
                fontWeight: item.highlight ? 800 : 500,
                color: item.highlight ? "#fff" : "rgba(255,255,255,0.7)",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: 999,
                background: item.highlight ? "rgba(255,255,255,0.15)" : "transparent",
                border: item.highlight ? "1px solid rgba(255,255,255,0.3)" : "1px solid transparent",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 5,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = item.highlight ? "rgba(255,255,255,0.15)" : "transparent";
                e.currentTarget.style.color = item.highlight ? "#fff" : "rgba(255,255,255,0.7)";
              }}
            >
              {item.highlight && <span>🌿</span>}
              {item.label}
            </a>
          ))}
        </div>

        {/* Language switcher */}
        <div style={{ display: "flex", background: "rgba(255,255,255,0.12)", borderRadius: 999, padding: 2 }}>
          {["en", "fr"].map((l) => (
            <a
              key={l}
              href={`/${l}`}
              style={{
                display: "block",
                background: lang === l ? "#fff" : "transparent",
                color: lang === l ? "#1e4d2b" : "rgba(255,255,255,0.6)",
                borderRadius: 999, padding: "3px 12px",
                fontSize: 11, fontWeight: 800,
                textDecoration: "none", transition: "all 0.2s",
              }}
            >
              {l.toUpperCase()}
            </a>
          ))}
        </div>
      </nav>

      <Header dict={dict} lang={lang} subtitle={dict.header.subtitle} />

      {/* ── Sustainability teaser ── */}
      <div style={{
        position: "relative",
        overflow: "hidden",
        minHeight: 220,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {/* Background nature photo */}
        <img
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1400&q=80"
          alt=""
          aria-hidden
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            filter: "brightness(0.45)",
          }}
        />
        {/* Content */}
        <div style={{
          position: "relative", zIndex: 1,
          textAlign: "center",
          padding: "40px 24px",
          maxWidth: 560,
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🌿</div>
          <h2 style={{
            fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.02em",
            marginBottom: 10,
            textTransform: "uppercase",
          }}>
            {lang === "fr" ? "La durabilité, c'est notre objectif" : "Sustainability is our goal"}
          </h2>
          <p style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: 14,
            lineHeight: 1.6,
            marginBottom: 20,
          }}>
            {lang === "fr"
              ? "Chaque événement reçoit un score écologique basé sur son accessibilité, son empreinte carbone et plus encore."
              : "Every event gets an eco-score based on transit access, carbon footprint, and more."}
          </p>
          <a
            href={`/${lang}/sustainability`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#1e4d2b",
              color: "#fff",
              textDecoration: "none",
              padding: "10px 22px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.03em",
              border: "1px solid rgba(255,255,255,0.25)",
              transition: "background 0.2s",
            }}
          >
            {lang === "fr" ? "Voir les scores" : "Explore sustainability"} →
          </a>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Map */}
        <div className="rounded-xl overflow-hidden shadow mb-8">
          <Map events={filtered} lang={lang} readMoreLabel={dict.event.readMore} selectedId={selectedId} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-5 mb-6 flex flex-wrap gap-6">
          {selectFilters.map((f) =>
            f.multi ? (
              <MultiSelect
                key={f.field}
                label={f.label}
                field={f.field}
                options={options[f.field].filter((o) => o !== ALL)}
                selected={f.value}
                onChange={f.set}
                dict={dict}
                lang={lang}
              />
            ) : (
              <div key={f.field}>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{f.label}</label>
                <select
                  className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                >
                  {options[f.field].map((o) => (
                    <option key={o} value={o}>{o === ALL ? dict.filters.all : tField(f.field, o, lang)}</option>
                  ))}
                </select>
              </div>
            )
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{dict.filters.startDate}</label>
            <input
              type="date"
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{dict.filters.endDate}</label>
            <input
              type="date"
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <p className="text-sm text-gray-400">
              {dict.results.count.replace("{count}", filtered.length)}
            </p>
          </div>
        </div>

        {/* Event Cards */}
        <div className="grid gap-4">
          {visible.map((event, i) => (
            <EventCard
              key={event.id ?? i}
              event={event}
              lang={lang}
              dict={dict}
              selected={selectedId === event.id}
              onSelect={() => setSelectedId((id) => (id === event.id ? null : event.id))}
              saved={isSaved(event.id)}
              onToggleSave={() => toggle(event.id)}
            />
          ))}
        </div>

        {visibleCount < filtered.length && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="border border-gray-200 bg-white rounded-lg px-6 py-2 text-sm font-medium text-green-700 shadow-sm hover:shadow transition"
            >
              {dict.results.loadMore.replace("{count}", filtered.length - visibleCount)}
            </button>
          </div>
        )}
      </main>
    </div>

      {/* ── Floating chat widget ── */}
      <ChatWidget lang={lang} dict={dict} />
  );
}
