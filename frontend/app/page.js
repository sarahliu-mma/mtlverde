"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), { ssr: false });

export default function Home() {
  const [events, setEvents] = useState([]);
  const [typeFilter, setTypeFilter] = useState("Tous");
  const [arrFilter, setArrFilter] = useState("Tous");
  const [coutFilter, setCoutFilter] = useState("Tous");
  const [empFilter, setEmpFilter] = useState("Tous");
  const [audFilter, setAudFilter] = useState("Tous");
  const [inscFilter, setInscFilter] = useState("Tous");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetch("https://mtlverde-production.up.railway.app/events/all")
      .then((res) => res.json())
      .then((data) => setEvents(data));
  }, []);

  // Unique, sorted dropdown values for a field, with "Tous" (all) pinned first.
  const optionsFor = (field) =>
    ["Tous", ...[...new Set(events.map((e) => e[field]).filter(Boolean))].sort()];

  // The five dropdown filters, driven by a config so the markup stays DRY.
  const selectFilters = [
    { label: "Type", field: "type_evenement", value: typeFilter, set: setTypeFilter },
    { label: "Arrondissement", field: "arrondissement", value: arrFilter, set: setArrFilter },
    { label: "Coût", field: "cout", value: coutFilter, set: setCoutFilter },
    { label: "Lieu", field: "emplacement", value: empFilter, set: setEmpFilter },
    { label: "Public", field: "public_cible", value: audFilter, set: setAudFilter },
    { label: "Inscription", field: "inscription", value: inscFilter, set: setInscFilter },
  ];

  const filtered = events.filter((e) => {
    const selectMatch = selectFilters.every(
      (f) => f.value === "Tous" || e[f.field] === f.value
    );
    // Date bounds (ISO strings compare chronologically): keep events starting
    // on/after startDate and ending on/before endDate. Empty = no bound.
    const startMatch = !startDate || (e.date_debut && e.date_debut >= startDate);
    const endMatch = !endDate || (e.date_fin && e.date_fin <= endDate);
    return selectMatch && startMatch && endMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-700 text-white px-8 py-5 shadow">
        <h1 className="text-3xl font-bold tracking-tight">MTLVerde 🌿</h1>
        <p className="text-green-200 text-sm mt-1">Découvrez les festivals de Montréal</p>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Map */}
        <div className="rounded-xl overflow-hidden shadow mb-8">
          <Map events={filtered} />
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
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date de début</label>
            <input
              type="date"
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date de fin</label>
            <input
              type="date"
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <p className="text-sm text-gray-400">{filtered.length} événement(s) trouvé(s)</p>
          </div>
        </div>

        {/* Event Cards */}
        <div className="grid gap-4">
          {filtered.map((event, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-5 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{event.titre}</h2>
                  <p className="text-sm text-gray-500 mt-1">{event.arrondissement}</p>
                  <p className="text-sm text-gray-400 mt-1">{event.date_debut} → {event.date_fin}</p>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{event.description}</p>
                </div>
                <span className={`ml-4 mt-1 shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
                  event.cout === "Gratuit"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-600"
                }`}>
                  {event.cout}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
