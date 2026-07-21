import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "./dictionaries";
import HomeClient from "./HomeClient";
import { API_BASE } from "@/lib/api";

// Fetch the combined feed on the server so events are baked into the initial
// HTML instead of a client-side waterfall after hydration. `revalidate` caches
// the result (ISR) and refreshes it every 5 min -- matching the backend's
// Cache-Control -- so this does not hit Railway on every request. On failure we
// return an empty list; HomeClient then refetches on the client as a fallback.
async function getEvents() {
  try {
    const res = await fetch(`${API_BASE}/events/all`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function Home({ params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const [dict, events] = await Promise.all([getDictionary(lang), getEvents()]);
  return <HomeClient dict={dict} lang={lang} initialEvents={events} />;
}
