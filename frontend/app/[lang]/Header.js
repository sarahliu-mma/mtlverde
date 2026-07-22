"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useBookmarks } from "@/lib/bookmarks";
import { API_BASE } from "@/lib/api";

export default function Header({ dict, lang }) {
  const pathname = usePathname();
  const { ids } = useBookmarks();
  const otherLocale = lang === "fr" ? "en" : "fr";

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
    return () => { cancelled = true; };
  }, [ids]);

  const count = ids.length === 0 ? 0 : liveCount;

  const rest = pathname.replace(/^\/(fr|en)(?=\/|$)/, "");
  const switchHref = `/${otherLocale}${rest || ""}`;

  return (
    <header className="sticky top-0 z-[1100] bg-green-700 text-white px-8 py-5 shadow">
      <div className="flex justify-between items-center">

        {/* Logo */}
        <Link href={`/${lang}`}>
          <img
            src="/MTLVerde_Logo.png"
            alt="MTLVerde"
            style={{ height: 48 }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </Link>

        {/* Nav links */}
        <nav className="flex gap-4 text-sm text-green-100">
          <Link href={`/${lang}#purpose`} className="hover:text-white hover:underline">
            {lang === "fr" ? "Mission" : "Purpose"}
          </Link>
          <Link href={`/${lang}/mission`} className="hover:text-white hover:underline">
            {dict.nav.mission}
          </Link>
          <Link href={`/${lang}/sustainability`} className="hover:text-white hover:underline">
            {dict.nav.sustainability}
          </Link>
          <Link href={`/${lang}`} className="hover:text-white hover:underline">
            {dict.nav.events}
          </Link>
          <Link href={`/${lang}#team`} className="hover:text-white hover:underline">
            {lang === "fr" ? "L'équipe" : "About the Team"}
          </Link>
          <Link href={`/${lang}/saved`} className="hover:text-white hover:underline flex items-center gap-1">
            {dict.nav.saved}
            {count > 0 && (
              <span className="bg-white/25 text-white text-xs font-semibold rounded-full px-1.5 py-0.5 leading-none">
                {count}
              </span>
            )}
          </Link>
          <Link href={`/${lang}#newsletter`} className="hover:text-white hover:underline">
            {lang === "fr" ? "Infolettre" : "Newsletter"}
          </Link>
          <Link href={`/${lang}/ask`} className="hover:text-white hover:underline">
            Ask MTLVerde
          </Link>
          <a href="mailto:mtlverde@gmail.com" className="hover:text-white hover:underline">
            {lang === "fr" ? "Nous joindre" : "Contact Us"}
          </a>
        </nav>

        {/* FR/EN toggle */}
        <Link
          href={switchHref}
          aria-label={dict.lang.label}
          className="shrink-0 border border-green-300 text-white text-sm font-semibold px-3 py-1 rounded-lg hover:bg-green-600 transition"
        >
          {dict.lang.switchTo}
        </Link>

      </div>
    </header>
  );
}
