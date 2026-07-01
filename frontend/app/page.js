"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), { ssr: false });

export default function Home() {
  const [events, setEvents] = useState([]);
  const [coutFilter, setCoutFilter] = useState("Tous");
  const [arrFilter, setArrFilter] = useState("Tous");

  useEffect(() => {
    fetch("http://localhost:8000/events")
      .then((res) => res.json())
      .then((data) => setEvents(data));
  }, []);

  const arrondissements = ["Tous", ...new Set(events.map((e) => e.arrondissement))];

  const filtered = events.filter((e) => {
    const coutMatch = coutFilter === "Tous" || e.cout === coutFilter;
    const arrMatch = arrFilter === "Tous" || e.arrondissement === arrFilter;
    return coutMatch && arrMatch;
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
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Coût</label>
            <select
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={coutFilter}
              onChange={(e) => setCoutFilter(e.target.value)}
            >
              <option>Tous</option>
              <option>Gratuit</option>
              <option>Payant</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Arrondissement</label>
            <select
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={arrFilter}
              onChange={(e) => setArrFilter(e.target.value)}
            >
              {arrondissements.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
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
