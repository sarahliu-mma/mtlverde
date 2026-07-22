"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useBookmarks } from "@/lib/bookmarks";
import { API_BASE } from "@/lib/api";

const GREEN_DARK  = "#1e4d2b";
const GREEN_LIGHT = "#e8f0e4";

export default function Header({ dict, lang }) {
  const pathname = usePathname();
  const { ids } = useBookmarks();
  const otherLocale = lang === "fr" ? "en" : "fr";
  const [liveCount, setLiveCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (ids.length === 0) return;
    let cancelled = false;
    fetch(`${API_BASE}/events/live-count`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setLiveCount(data.count ?? ids.length); })
      .catch(() => { if (!cancelled) setLiveCount(ids.length); });
    return () => { cancelled = true; };
  }, [ids]);

  const count = ids.length === 0 ? 0 : liveCount;
  const rest = pathname.replace(/^\/(fr|en)(?=\/|$)/, "");
  const linkColor = scrolled ? "#333" : "rgba(255,255,255,0.92)";

  const navItems = [
    { label: lang === "fr" ? "Mission" : "Our Purpose",      href: `/${lang}#purpose` },
    { label: lang === "fr" ? "Notre mission" : "Our Mission", href: `/${lang}/mission` },
    { label: lang === "fr" ? "Durabilité" : "Sustainability", href: `/${lang}/sustainability` },
    { label: lang === "fr" ? "Événements" : "Events",         href: `/${lang}` },
    { label: lang === "fr" ? "L'équipe" : "About the Team",   href: `/${lang}#team` },
    { label: lang === "fr" ? "Sauvegardés" : "Saved",         href: `/${lang}/saved`, badge: count },
    { label: lang === "fr" ? "Infolettre" : "Newsletter",     href: `/${lang}#newsletter` },
    { label: "Ask MTLVerde",                                   href: `/${lang}/ask` },
    { label: lang === "fr" ? "Nous joindre" : "Contact Us",   href: "mailto:mtlverde@gmail.com" },
  ];

  return (
    <header style={{
      position: "fixed",
      top: 0, left: 0, right: 0,
      zIndex: 1100,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 32px",
      height: 68,
      background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? `1px solid ${GREEN_LIGHT}` : "none",
      transition: "all 0.35s ease",
    }}>

      {/* Logo — left */}
      <Link href={`/${lang}`} style={{ flexShrink: 0 }}>
        <img
          src="/MTLVerde_Logo.png"
          alt="MTLVerde"
          style={{ height: 90, filter: scrolled ? "none" : "brightness(10)", display: "block", cursor: "pointer" }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      </Link>

      {/* Nav links — center */}
      <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            style={{
              fontSize: 14, fontWeight: 500,
              textDecoration: "none",
              color: linkColor,
              transition: "color 0.2s",
              whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: 4,
            }}
            onMouseEnter={e => e.currentTarget.style.color = scrolled ? GREEN_DARK : "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = linkColor}
          >
            {item.label}
            {item.badge > 0 && (
              <span style={{ background: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "2px 6px" }}>
                {item.badge}
              </span>
            )}
          </a>
        ))}
      </nav>

      {/* EN / FR pill toggle — right */}
      <div style={{
        display: "flex",
        background: scrolled ? GREEN_LIGHT : "rgba(255,255,255,0.18)",
        borderRadius: 999,
        padding: 3,
        flexShrink: 0,
      }}>
        {["en", "fr"].map((l) => (
          <a
            key={l}
            href={`/${l}${rest || ""}`}
            style={{
              display: "block",
              background: lang === l ? (scrolled ? GREEN_DARK : "#fff") : "transparent",
              color: lang === l ? (scrolled ? "#fff" : GREEN_DARK) : (scrolled ? "#666" : "rgba(255,255,255,0.75)"),
              borderRadius: 999,
              padding: "5px 14px",
              fontSize: 12, fontWeight: 800,
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            {l.toUpperCase()}
          </a>
        ))}
      </div>

    </header>
  );
}
