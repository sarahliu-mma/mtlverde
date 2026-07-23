"use client";
import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { useAuth } from "@/app/[lang]/AuthProvider";
import { supabase } from "@/lib/supabase";

// Event bookmarks with two backends behind one interface:
//   - guest (signed out): hearted event ids in the browser's localStorage
//   - signed in: rows in the Supabase `bookmarks` table (synced across devices)
// A single BookmarksProvider holds the active source so every consumer (header
// count, event cards, saved page) stays in sync. Only event ids are stored, so
// the saved page can intersect them against the live feed and drop removed events.

const KEY = "mtlverde:bookmarks";
// The native "storage" event only fires in *other* tabs; this custom event keeps
// the current tab's guest reader in sync after a write.
const CHANGED = "mtlverde:bookmarks-changed";
// Stable empty reference so useSyncExternalStore never sees a fresh array when
// nothing changed.
const EMPTY = [];

// getSnapshot must return a cached reference until the stored value actually
// changes, or React's useSyncExternalStore loops. Memoize on the raw string.
let cache = { raw: null, ids: EMPTY };
function guestSnapshot() {
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
function guestServerSnapshot() {
  return EMPTY;
}
function guestSubscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGED, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGED, callback);
  };
}
function writeGuest(ids) {
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(CHANGED));
}

// Exposed for the merge-on-sign-in step.
export function readGuestIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
export function clearGuestIds() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(CHANGED));
}

const BookmarksContext = createContext({
  ids: EMPTY,
  count: 0,
  toggle: () => {},
  isSaved: () => false,
  mergedCount: 0,
  clearMerged: () => {},
});

export function BookmarksProvider({ children }) {
  const { user } = useAuth();
  const guestIds = useSyncExternalStore(guestSubscribe, guestSnapshot, guestServerSnapshot);
  const [accountIds, setAccountIds] = useState(EMPTY);
  // How many guest bookmarks were just merged into the account on this sign-in,
  // so the UI can show a one-time confirmation. Cleared once acknowledged.
  const [mergedCount, setMergedCount] = useState(0);

  // On sign-in: merge any guest (localStorage) bookmarks into the account, then
  // load this user's bookmarks from Supabase. RLS scopes the query to their own
  // rows. State is only written in the async callback, so nothing is set
  // synchronously in the effect.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      // Carry a guest's saved events into their account, then clear the local
      // copy so it doesn't linger. ignoreDuplicates makes events already in the
      // account a no-op. Only clear if the merge succeeded, to avoid data loss.
      const guest = readGuestIds();
      if (guest.length) {
        const { error } = await supabase
          .from("bookmarks")
          .upsert(
            guest.map((event_id) => ({ user_id: user.id, event_id })),
            { onConflict: "user_id,event_id", ignoreDuplicates: true },
          );
        if (!error) {
          clearGuestIds();
          if (!cancelled) setMergedCount(guest.length);
        }
      }
      const { data } = await supabase.from("bookmarks").select("event_id");
      if (!cancelled) setAccountIds((data ?? []).map((row) => row.event_id));
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const ids = user ? accountIds : guestIds;

  const toggle = useCallback(
    (id) => {
      if (id == null) return;
      const key = String(id);

      if (user) {
        const saved = accountIds.includes(key);
        // Optimistic update, reverted if the write fails.
        setAccountIds((prev) => (saved ? prev.filter((x) => x !== key) : [...prev, key]));
        const request = saved
          ? supabase.from("bookmarks").delete().eq("user_id", user.id).eq("event_id", key)
          : supabase.from("bookmarks").insert({ user_id: user.id, event_id: key });
        request.then(({ error }) => {
          if (error) {
            setAccountIds((prev) => (saved ? [...prev, key] : prev.filter((x) => x !== key)));
          }
        });
      } else {
        const current = guestSnapshot();
        writeGuest(current.includes(key) ? current.filter((x) => x !== key) : [...current, key]);
      }
    },
    [user, accountIds],
  );

  const isSaved = useCallback((id) => ids.includes(String(id)), [ids]);
  const clearMerged = useCallback(() => setMergedCount(0), []);

  return (
    <BookmarksContext.Provider value={{ ids, count: ids.length, toggle, isSaved, mergedCount, clearMerged }}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  return useContext(BookmarksContext);
}
