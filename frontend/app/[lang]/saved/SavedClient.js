"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../Header";
import EventCard from "../EventCard";
import { useBookmarks } from "@/lib/bookmarks";
import { API_BASE } from "@/lib/api";

// Saved-events page for guests. Reads the hearted ids from localStorage and
// intersects them against the live /events/all feed, so an event the city has
// since dropped simply stops appearing rather than lingering as a stale entry.
export default function SavedClient({ dict, lang }) {
  const [events, setEvents] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const { isSaved, toggle, count } = useBookmarks();

  useEffect(() => {
    fetch(`${API_BASE}/events/all`)
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch(() => setEvents([]))
      .finally(() => setLoaded(true));
  }, []);

  const saved = events.filter((e) => isSaved(e.id));

  // Nothing saved at all -> empty state immediately (no need to wait on fetch).
  // Ids saved but feed still loading -> loading. Loaded but none match (all
  // dropped from the feed) -> empty state.
  const showEmpty = count === 0 || (loaded && saved.length === 0);
  const showLoading = count > 0 && !loaded && saved.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header dict={dict} lang={lang} subtitle={dict.header.subtitle} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{dict.saved.heading}</h1>

        {showLoading && (
          <p className="text-gray-400 text-sm">{dict.saved.loading}</p>
        )}

        {showEmpty && (
          <div className="flex flex-col items-center text-center bg-white border border-gray-100 rounded-xl py-16 px-6">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <svg
                viewBox="0 0 24 24"
                className="w-7 h-7 text-red-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-1">{dict.saved.empty}</p>
            <p className="text-sm text-gray-500 mb-6 max-w-sm leading-relaxed">{dict.saved.emptyHint}</p>
            <Link
              href={`/${lang}`}
              className="bg-green-700 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-green-800 transition"
            >
              {dict.saved.browse}
            </Link>
          </div>
        )}

        {!showEmpty && !showLoading && (
          <>
            <div className="grid gap-4">
              {saved.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  lang={lang}
                  dict={dict}
                  saved
                  onToggleSave={() => toggle(event.id)}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mt-6">{dict.saved.note}</p>
          </>
        )}
      </main>
    </div>
  );
}
