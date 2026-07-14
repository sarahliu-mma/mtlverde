"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Shared site header: brand, page nav, and a language switch that keeps the
// visitor on the same page when toggling (e.g. /fr/mission -> /en/mission).
export default function Header({ dict, lang, subtitle }) {
  const pathname = usePathname();
  const otherLocale = lang === "fr" ? "en" : "fr";

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
