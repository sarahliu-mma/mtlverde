"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useBookmarks } from "@/lib/bookmarks";
import { useAuth } from "./AuthProvider";
import { API_BASE } from "@/lib/api";

const GREEN_DARK  = "#1e4d2b";
const GREEN_LIGHT = "#e8f0e4";

export default function Header({ dict, lang }) {
  const pathname = usePathname();
  const { ids } = useBookmarks();
  const { user, signOut } = useAuth();
  const [liveCount, setLiveCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  function handleNavClick(e, href) {
    setMenuOpen(false); 
    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) return;
    const hash = href.slice(hashIndex + 1);
    const target = document.getElementById(hash);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", href);
    }
  }

  const count = ids.length === 0 ? 0 : liveCount;
  const rest = pathname.replace(/^\/(fr|en)(?=\/|$)/, "");
  const linkColor = scrolled ? "#333" : "rgba(255,255,255,0.92)";

  const navItems = [
    { label: lang === "fr" ? "Mission"       : "Our Purpose",     href: `/${lang}#purpose`         },
    { label: lang === "fr" ? "Notre mission"  : "Our Mission",     href: `/${lang}/mission`          },
    { label: lang === "fr" ? "Événements"     : "Events",          href: `/${lang}#events`           },
    { label: lang === "fr" ? "En vedette"     : "Featured",        href: `/${lang}/festivals`        },
    { label: lang === "fr" ? "Durabilité"     : "Sustainability",  href: `/${lang}/sustainability`   },
    { label: lang === "fr" ? "L'équipe"       : "About the Team",  href: `/${lang}#team`             },
    { label: lang === "fr" ? "Sauvegardés"    : "Saved",           href: `/${lang}/saved`, badge: count },
    { label: lang === "fr" ? "Infolettre"     : "Newsletter",      href: `/${lang}#newsletter`       },
    { label: "Ask MTLVerde",                                        href: `/${lang}/recommendations`  },
    { label: lang === "fr" ? "Nous joindre"   : "Contact Us",      href: "mailto:mtlverde@gmail.com" },
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
    <style jsx>{`
      .desktop-nav { display: flex; }
      .mobile-menu-btn { display: none; }
      .mobile-menu-panel { display: none; }
      @media (max-width: 900px) {
        .desktop-nav { display: none; }
        .mobile-menu-btn { display: flex; }
        .mobile-menu-panel.open { display: flex; }
      }
    `}</style>

      {/* Logo */}
      <Link href={`/${lang}`} style={{ flexShrink: 0 }}>
        <img
          src="/MTLVerde_Logo.png"
          alt="MTLVerde"
          style={{ height: 90, filter: scrolled ? "none" : "brightness(10)", display: "block", cursor: "pointer" }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      </Link>

      {/* Nav links */}
      <nav className="desktop-nav" style={{ alignItems: "center", gap: 28 }}>
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={(e) => handleNavClick(e, item.href)}
            style={{
              fontSize: 14, fontWeight: 500,
              textDecoration: "none",
              color: linkColor,
              transition: "color 0.2s",
              whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: 4,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = scrolled ? GREEN_DARK : "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = linkColor; }}
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

    {/* Hamburger (mobile) */}
      <button
        type="button"
        className="mobile-menu-btn"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
        style={{
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 5,
          width: 36, height: 36,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <span style={{ display: "block", width: 22, height: 2, background: linkColor, transition: "all 0.2s" }} />
        <span style={{ display: "block", width: 22, height: 2, background: linkColor, transition: "all 0.2s" }} />
        <span style={{ display: "block", width: 22, height: 2, background: linkColor, transition: "all 0.2s" }} />
      </button>
      
      {/* Mobile dropdown panel */}
      <div className={`mobile-menu-panel${menuOpen ? " open" : ""}`} style={{
        flexDirection: "column",
        position: "fixed",
        top: 68, left: 0, right: 0,
        maxHeight: "calc(100vh - 68px)",
        overflowY: "auto",
        background: "#fff",
        borderTop: `1px solid ${GREEN_LIGHT}`,
        boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
        padding: "8px 24px 24px",
      }}>
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={(e) => handleNavClick(e, item.href)}
            style={{
              fontSize: 16, fontWeight: 600,
              textDecoration: "none",
              color: "#333",
              padding: "14px 0",
              borderBottom: `1px solid ${GREEN_LIGHT}`,
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            {item.label}
            {item.badge > 0 && (
              <span style={{ background: GREEN_LIGHT, color: GREEN_DARK, fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "2px 8px" }}>
                {item.badge}
              </span>
            )}
          </a>
        ))}
      </div>

      {/* Auth + EN / FR */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: linkColor, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              style={{
                fontSize: 12, fontWeight: 800,
                color: scrolled ? "#fff" : GREEN_DARK,
                background: scrolled ? GREEN_DARK : "#fff",
                border: "none", borderRadius: 999, padding: "6px 14px",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {dict.auth.logOut}
            </button>
          </div>
        ) : (
          <Link
            href={`/${lang}/login`}
            style={{
              fontSize: 12, fontWeight: 800, textDecoration: "none",
              color: scrolled ? "#fff" : GREEN_DARK,
              background: scrolled ? GREEN_DARK : "#fff",
              borderRadius: 999, padding: "6px 14px",
              transition: "all 0.2s",
            }}
          >
            {dict.auth.logIn}
          </Link>
        )}

        <div style={{
          display: "flex",
          background: scrolled ? GREEN_LIGHT : "rgba(255,255,255,0.18)",
          borderRadius: 999,
          padding: 3,
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
      </div>

    </header>
  );
}
