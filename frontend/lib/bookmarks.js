"use client";
import { useCallback, useSyncExternalStore } from "react";

// Guest bookmarks: hearted event ids kept in the browser's localStorage, no
// account or backend required. We store only ids (not whole events), so the
// saved page intersects them against the live feed -- an event the city drops
// simply stops appearing rather than lingering as a stale snapshot.
const KEY = "mtlverde:bookmarks";

// The native "storage" event only fires in *other* tabs, so we also dispatch
// this custom event to keep hooks in the *current* tab (cards + header count +
// saved page) in sync after a toggle.
const CHANGED = "mtlverde:bookmarks-changed";

// Stable empty reference for the server snapshot and the parse-failure case, so
// useSyncExternalStore never sees a brand-new array when nothing has changed.
const EMPTY = [];

// getSnapshot must return a cached reference until the stored value actually
// changes; parsing on every call would hand React a fresh array each render and
// trip its "getSnapshot should be cached" infinite loop. We memoize on the raw
// string and only reparse when it differs.
let cache = { raw: null, ids: EMPTY };

function getSnapshot() {
  const raw = localStorage.getItem(KEY);
  if (raw !== cache.raw) {
    let ids = EMPTY;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) ids = parsed;
    } catch {
      ids = EMPTY;
    }
    cache = { raw, ids };
  }
  return cache.ids;
}

function getServerSnapshot() {
  return EMPTY;
}

function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGED, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGED, callback);
  };
}

export function useBookmarks() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((id) => {
    if (id == null) return;
    const key = String(id);
    const next = getSnapshot().slice();
    const at = next.indexOf(key);
    if (at === -1) next.push(key);
    else next.splice(at, 1);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGED));
  }, []);

  const isSaved = useCallback((id) => ids.includes(String(id)), [ids]);

  return { ids, count: ids.length, toggle, isSaved };
}
