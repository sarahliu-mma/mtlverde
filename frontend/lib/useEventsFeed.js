"use client";
import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

// Module-level singleton so the events feed is fetched at most once per
// browser tab and shared across every page that needs it (Home, Sustainability,
// Saved), instead of each page independently re-fetching and re-parsing the
// same multi-MB payload. Survives client-side <Link> navigation because the JS
// module registry persists across those; only a hard reload clears it.
const cache = {
  data: null,     // array once loaded, else null
  promise: null,  // in-flight fetch promise, shared by concurrent mounts
  error: null,
};

function startFetch() {
  cache.error = null;
  cache.promise = fetch(`${API_BASE}/events/all`)
    .then((res) => {
      if (!res.ok) throw new Error(`events/all ${res.status}`);
      return res.json();
    })
    .then((data) => {
      cache.data = Array.isArray(data) ? data : [];
      cache.promise = null;
      return cache.data;
    })
    .catch((err) => {
      cache.promise = null;
      cache.error = err;
      throw err; // don't poison cache.data -- next mount can retry
    });
  return cache.promise;
}

export function useEventsFeed({ initialData } = {}) {
  // Synchronous seed (render time, not effect time) so the first client render
  // already reflects SSR-supplied data -- avoids an empty->populated flash and
  // keeps hydration deterministic.
  if (cache.data === null && Array.isArray(initialData) && initialData.length > 0) {
    cache.data = initialData;
  }

  const [events, setEvents]   = useState(cache.data ?? []);
  const [loading, setLoading] = useState(cache.data === null);
  const [error, setError]     = useState(cache.error);

  useEffect(() => {
    if (cache.data !== null) {
      setEvents(cache.data);
      setLoading(false);
      return;
    }
    let cancelled = false;
    const inFlight = cache.promise ?? startFetch();
    setLoading(true);
    inFlight
      .then((data) => { if (!cancelled) { setEvents(data); setLoading(false); } })
      .catch((err)  => { if (!cancelled) { setError(err); setLoading(false); } });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, loading, error };
}
