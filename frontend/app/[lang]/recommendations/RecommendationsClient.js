"use client";
import { useEffect, useState, useCallback } from "react";
import Header from "../Header";
import EventCard from "../EventCard";
import { useBookmarks } from "@/lib/bookmarks";
import { API_BASE } from "@/lib/api";

// Local storage key for remembering the user's tag preferences across visits.
// Kept separate from the bookmarks key in lib/bookmarks.js since this stores
// filter selections, not saved event ids.
const PREFS_KEY = "mtlverde_recommendation_prefs";

const TYPE_TAGS = [
  "music", "art", "performance", "film", "exhibition",
  "market", "food", "outdoor_sport", "tech", "reading", "kids",
];

// Reads saved preferences from localStorage. Returns defaults if nothing
// is stored yet, or if the stored value is malformed.
function loadPrefs() {
  if (typeof window === "undefined") return defaultPrefs();
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return defaultPrefs();
    const parsed = JSON.parse(raw);
    return { ...defaultPrefs(), ...parsed };
  } catch {
    return defaultPrefs();
  }
}

function defaultPrefs() {
  return {
    types: [],
    freeOnly: false,
    ecoOnly: false,
    familyOnly: false,
    outdoorOnly: false,
  };
}

export default function RecommendationsClient({ dict, lang }) {
  const r = dict.recommendations;
  const { isSaved, toggle } = useBookmarks();

  // Start with defaults on the server render, then sync from localStorage
  // once mounted client-side. Avoids a hydration mismatch.
  const [prefs, setPrefs] = useState(defaultPrefs());
  const [hydrated, setHydrated] = useState(false);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    // Reading localStorage must happen after mount; this is a one-time
    // hydration step, not an ongoing sync loop, so the direct setState here is safe.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefs(loadPrefs());
    setHydrated(true);
  }, []);

  // Persist preferences whenever they change, but only after the initial
  // load from localStorage has happened (avoids overwriting saved prefs
  // with the defaults on first render).
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs, hydrated]);

  const toggleType = useCallback((tag) => {
    setPrefs((p) => {
      const has = p.types.includes(tag);
      return {
        ...p,
        types: has ? p.types.filter((t) => t !== tag) : [...p.types, tag],
      };
    });
  }, []);

  const fetchRecommendations = useCallback(() => {
    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams();
    if (prefs.types.length) params.set("tags", prefs.types.join(","));
    if (prefs.outdoorOnly) params.set("location", "outdoor");
    if (prefs.freeOnly) params.set("free_only", "true");
    if (prefs.ecoOnly) params.set("eco_only", "true");
    if (prefs.familyOnly) params.set("family_only", "true");
    params.set("limit", "20");

    fetch(`${API_BASE}/api/recommendations?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setResults(data.results || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [prefs]);

  // Auto-run the search once preferences are loaded from localStorage,
  // so returning visitors see results immediately without an extra click.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hydrated) fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header dict={dict} lang={lang} subtitle={r.heading} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{r.heading}</h1>
        <p className="text-gray-600 mb-6 leading-relaxed">{r.intro}</p>

        {/* Type tags */}
        <section className="mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">{r.typeLabel}</h2>
          <div className="flex flex-wrap gap-2">
            {TYPE_TAGS.map((tag) => {
              const active = prefs.types.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleType(tag)}
                  aria-pressed={active}
                  className={`text-sm px-3 py-1.5 rounded-full border transition ${
                    active
                      ? "bg-green-700 text-white border-green-700"
                      : "bg-white text-gray-600 border-gray-300 hover:border-green-400"
                  }`}
                >
                  {r.types[tag]}
                </button>
              );
            })}
          </div>
        </section>

        {/* Quick filters */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">{r.quickFilters}</h2>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={prefs.freeOnly}
                onChange={(e) => setPrefs((p) => ({ ...p, freeOnly: e.target.checked }))}
              />
              {r.freeOnly}
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={prefs.ecoOnly}
                onChange={(e) => setPrefs((p) => ({ ...p, ecoOnly: e.target.checked }))}
              />
              {r.ecoOnly}
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={prefs.familyOnly}
                onChange={(e) => setPrefs((p) => ({ ...p, familyOnly: e.target.checked }))}
              />
              {r.familyOnly}
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={prefs.outdoorOnly}
                onChange={(e) => setPrefs((p) => ({ ...p, outdoorOnly: e.target.checked }))}
              />
              {r.outdoorOnly}
            </label>
          </div>
        </section>

        <button
          type="button"
          onClick={fetchRecommendations}
          className="bg-green-700 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-green-800 transition mb-8"
        >
          {r.showResults}
        </button>

        {/* Results */}
        {loading && <p className="text-gray-500">{r.loading}</p>}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg font-semibold text-gray-800 mb-1">{r.empty}</p>
            <p className="text-sm text-gray-500">{r.emptyHint}</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid gap-4">
            {results.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                lang={lang}
                dict={dict}
                saved={isSaved(event.id)}
                onToggleSave={() => toggle(event.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
