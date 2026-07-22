"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Header from "./Header";
import EventCard from "./EventCard";
import MultiSelect from "./MultiSelect";
import { tField } from "./eventData";
import { useBookmarks } from "@/lib/bookmarks";
import { API_BASE } from "@/lib/api";

const Map = dynamic(() => import("./Map"), { ssr: false });

// Internal sentinel for the "no filter" dropdown option. Kept language-neutral
// so filtering logic never depends on the displayed (translated) label.
const ALL = "Tous";

// How many event cards to show initially and per "load more" click. The map
// always shows the full filtered set; this only caps the rendered card list.
const PAGE_SIZE = 24;

export default function HomeClient({ dict, lang, initialEvents = [] }) {
  const [events, setEvents] = useState(initialEvents);
  // Multi-select filters hold an array of chosen values; [] means "no filter".
  const [typeFilter, setTypeFilter] = useState([]);
  const [arrFilter, setArrFilter] = useState([]);
  const [audFilter, setAudFilter] = useState([]);
  // Single-select filters keep the ALL sentinel.
  const [coutFilter, setCoutFilter] = useState(ALL);
  const [empFilter, setEmpFilter] = useState(ALL);
  const [inscFilter, setInscFilter] = useState(ALL);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { isSaved, toggle } = useBookmarks();

  // The feed is normally provided by the server (see page.js), so no fetch runs
  // here. This is only a fallback for when the server-side fetch returned empty
  // (e.g. Railway was down at build/revalidate time).
  useEffect(() => {
    if (initialEvents.length) return;
    fetch(`${API_BASE}/events/all`)
      .then((res) => res.json())
      .then((data) => setEvents(data));
  }, [initialEvents.length]);

  // Unique, sorted dropdown values per filter field, with the "all" sentinel
  // pinned first. Memoized on `events` so we don't rebuild six Sets over the
  // whole feed on every render (e.g. selecting a card or typing a date).
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

  // The six dropdown filters. Labels come from the dictionary; `field` maps to
  // the (French) event data keys, which are unchanged.
  const selectFilters = [
    { label: dict.filters.type, field: "type_evenement", value: typeFilter, set: setTypeFilter, multi: true },
    { label: dict.filters.arrondissement, field: "arrondissement", value: arrFilter, set: setArrFilter, multi: true },
    { label: dict.filters.cout, field: "cout", value: coutFilter, set: setCoutFilter },
    { label: dict.filters.lieu, field: "emplacement", value: empFilter, set: setEmpFilter },
    { label: dict.filters.public, field: "public_cible", value: audFilter, set: setAudFilter, multi: true },
    { label: dict.filters.inscription, field: "inscription", value: inscFilter, set: setInscFilter },
  ];

  // Memoized so the array reference only changes when a filter actually changes
  // -- not on every render. This keeps the Map from clearing and rebuilding all
  // ~3k markers when unrelated state (selected card, load-more) updates.
  const filtered = useMemo(() => {
    // Multi-select filters: an event matches if it's in the chosen set (OR
    // within a filter). Single-select filters keep the ALL sentinel. Filters
    // still combine with AND across fields.
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
      // Date bounds (ISO strings compare chronologically): keep events starting
      // on/after startDate and ending on/before endDate. Empty = no bound.
      const startMatch = !startDate || (e.date_debut && e.date_debut >= startDate);
      const endMatch = !endDate || (e.date_fin && e.date_fin <= endDate);
      return selectMatch && startMatch && endMatch;
    });
  }, [events, typeFilter, arrFilter, coutFilter, empFilter, audFilter, inscFilter, startDate, endDate]);

  // Reset the visible window whenever the filters change, so a new search
  // starts from the top rather than keeping a previously expanded count. Done
  // during render (React's "adjust state when an input changes" pattern) by
  // comparing against the previous filter signature -- avoids the extra render
  // pass an effect would cause.
  const filterKey = JSON.stringify([typeFilter, arrFilter, coutFilter, empFilter, audFilter, inscFilter, startDate, endDate]);
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header dict={dict} lang={lang} subtitle={dict.header.subtitle} />

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
  );
}
