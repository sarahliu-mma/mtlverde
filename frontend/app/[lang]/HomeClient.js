"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Header from "./Header";
import { tField, eventTitle, eventDescription } from "./eventData";

const Map = dynamic(() => import("./Map"), { ssr: false });

// Internal sentinel for the "no filter" dropdown option. Kept language-neutral
// so filtering logic never depends on the displayed (translated) label.
const ALL = "Tous";

export default function HomeClient({ dict, lang }) {
  const [events, setEvents] = useState([]);
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [arrFilter, setArrFilter] = useState(ALL);
  const [coutFilter, setCoutFilter] = useState(ALL);
  const [empFilter, setEmpFilter] = useState(ALL);
  const [audFilter, setAudFilter] = useState(ALL);
  const [inscFilter, setInscFilter] = useState(ALL);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetch("https://mtlverde-production.up.railway.app/events/all")
      .then((res) => res.json())
      .then((data) => setEvents(data));
  }, []);

  // Unique, sorted dropdown values for a field, with the "all" sentinel pinned first.
  const optionsFor = (field) =>
    [ALL, ...[...new Set(events.map((e) => e[field]).filter(Boolean))].sort()];

  // The six dropdown filters. Labels come from the dictionary; `field` maps to
  // the (French) event data keys, which are unchanged.
  const selectFilters = [
    { label: dict.filters.type, field: "type_evenement", value: typeFilter, set: setTypeFilter },
    { label: dict.filters.arrondissement, field: "arrondissement", value: arrFilter, set: setArrFilter },
    { label: dict.filters.cout, field: "cout", value: coutFilter, set: setCoutFilter },
    { label: dict.filters.lieu, field: "emplacement", value: empFilter, set: setEmpFilter },
    { label: dict.filters.public, field: "public_cible", value: audFilter, set: setAudFilter },
    { label: dict.filters.inscription, field: "inscription", value: inscFilter, set: setInscFilter },
  ];

  const filtered = events.filter((e) => {
    const selectMatch = selectFilters.every(
      (f) => f.value === ALL || e[f.field] === f.value
    );
    // Date bounds (ISO strings compare chronologically): keep events starting
    // on/after startDate and ending on/before endDate. Empty = no bound.
    const startMatch = !startDate || (e.date_debut && e.date_debut >= startDate);
    const endMatch = !endDate || (e.date_fin && e.date_fin <= endDate);
    return selectMatch && startMatch && endMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header dict={dict} lang={lang} subtitle={dict.header.subtitle} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Map */}
        <div className="rounded-xl overflow-hidden shadow mb-8">
          <Map events={filtered} lang={lang} readMoreLabel={dict.event.readMore} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-5 mb-6 flex flex-wrap gap-6">
          {selectFilters.map((f) => (
            <div key={f.field}>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{f.label}</label>
              <select
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
              >
                {optionsFor(f.field).map((o) => (
                  <option key={o} value={o}>{o === ALL ? dict.filters.all : tField(f.field, o, lang)}</option>
                ))}
              </select>
            </div>
          ))}
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
          {filtered.map((event, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-5 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{eventTitle(event, lang)}</h2>
                  <p className="text-sm text-gray-500 mt-1">{event.arrondissement}</p>
                  <p className="text-sm text-gray-400 mt-1">{event.date_debut} → {event.date_fin}</p>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{eventDescription(event, lang)}</p>
                  {event.url_fiche && (
                    <a
                      href={event.url_fiche}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-green-700 hover:underline mt-2 inline-block"
                    >
                      {dict.event.readMore}
                    </a>
                  )}
                </div>
                <div className="ml-4 mt-1 shrink-0 flex gap-2">
                  {event.type_evenement && (
                    <span className="whitespace-nowrap text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                      {tField("type_evenement", event.type_evenement, lang)}
                    </span>
                  )}
                  {event.public_cible && (
                    <span className="whitespace-nowrap text-xs font-semibold px-3 py-1 rounded-full bg-pink-100 text-pink-700">
                      {tField("public_cible", event.public_cible, lang)}
                    </span>
                  )}
                  <span className={`whitespace-nowrap text-xs font-semibold px-3 py-1 rounded-full ${
                    event.cout === "Gratuit"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {tField("cout", event.cout, lang)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
