"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useBookmarks } from "@/lib/bookmarks";
import { API_BASE } from "@/lib/api";

// Shared site header: brand, page nav, and a language switch that keeps the
// visitor on the same page when toggling (e.g. /fr/mission -> /en/mission).
export default function Header({ dict, lang, subtitle }) {
  const pathname = usePathname();
  const { ids } = useBookmarks();
  const otherLocale = lang === "fr" ? "en" : "fr";

  // The badge shows how many saved events are still in the live feed, so it
  // matches the saved page (which drops events the city has removed). We ask
  // the backend rather than shipping the whole feed here just to count; if the
  // request fails we fall back to the raw saved count. The empty case is
  // derived (not set in the effect) so no state is written synchronously here.
  const [liveCount, setLiveCount] = useState(0);
  useEffect(() => {
    if (ids.length === 0) return;
    let cancelled = false;
    fetch(`${API_BASE}/events/live-count`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setLiveCount(data.count ?? ids.length);
      })
      .catch(() => {
        if (!cancelled) setLiveCount(ids.length);
      });
    return () => {
      cancelled = true;
    };
  }, [ids]);
  const count = ids.length === 0 ? 0 : liveCount;

  // Swap the leading locale segment, preserving the rest of the path.
  const rest = pathname.replace(/^\/(fr|en)(?=\/|$)/, "");
  const switchHref = `/${otherLocale}${rest || ""}`;

  return (
    <header className="sticky top-0 z-[1100] bg-green-700 text-white px-8 py-5 shadow">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href={`/${lang}`} className="text-2xl font-bold tracking-tight">
            {dict.header.brand}
          </Link>
          <nav className="flex gap-4 text-sm text-green-100">
            <Link href={`/${lang}`} className="hover:text-white hover:underline">
              {dict.nav.events}
            </Link>
            <Link href={`/${lang}/mission`} className="hover:text-white hover:underline">
              {dict.nav.mission}
            </Link>
            <Link href={`/${lang}/sustainability`} className="hover:text-white hover:underline">
              {dict.nav.sustainability}
            </Link>
            <Link href={`/${lang}/saved`} className="hover:text-white hover:underline flex items-center gap-1">
              {dict.nav.saved}
              {count > 0 && (
                <span className="bg-white/25 text-white text-xs font-semibold rounded-full px-1.5 py-0.5 leading-none">
                  {count}
                </span>
              )}
            </Link>
            <Link href={`/${lang}/recommendations`} className="hover:text-white hover:underline">
              {dict.nav.recommendations}
            </Link>
          </nav>
        </div>
        <Link
          href={switchHref}
          aria-label={dict.lang.label}
          className="shrink-0 border border-green-300 text-white text-sm font-semibold px-3 py-1 rounded-lg hover:bg-green-600 transition"
        >
          {dict.lang.switchTo}
        </Link>
      </div>
      {subtitle ? <p className="text-green-200 text-sm mt-2">{subtitle}</p> : null}
    </header>
  );
}
