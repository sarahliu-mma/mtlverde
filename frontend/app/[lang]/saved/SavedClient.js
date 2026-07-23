"use client";
import { useEffect, useState } from "react";
import Header from "../Header";
import EventCard from "../EventCard";
import { useBookmarks } from "@/lib/bookmarks";
import { useAuth } from "../AuthProvider";
import { API_BASE } from "@/lib/api";

const GREEN_DARK  = "#1e4d2b";
const GREEN_MID   = "#6a9e5a";
const CREAM       = "#f9f6f1";
const RUST        = "#b5281c";
const DARK        = "#111";
const WHITE       = "#ffffff";

function HeartIcon({ filled = false, size = 24, color = RUST }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}
      fill={filled ? color : "none"} stroke={color}
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function SavedClient({ dict, lang }) {
  const [events, setEvents]   = useState([]);
  const [loaded, setLoaded]   = useState(false);
  const { isSaved, toggle, count } = useBookmarks();
  const { user } = useAuth();

  useEffect(() => {
    fetch(`${API_BASE}/events/all`)
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(() => setEvents([]))
      .finally(() => setLoaded(true));
  }, []);

  const saved       = events.filter(e => isSaved(e.id));
  const showEmpty   = count === 0 || (loaded && saved.length === 0);
  const showLoading = count > 0 && !loaded && saved.length === 0;
  const fr = lang === "fr";

  return (
    <div style={{ fontFamily: "'DM Sans','Inter',sans-serif", background: CREAM, color: DARK, margin: 0, padding: 0 }}>
      <style>{`
        * { box-sizing: border-box; }
        .sv-card-wrap { background: ${WHITE}; border-radius: 18px; border: 1px solid rgba(0,0,0,0.06); overflow: hidden; transition: box-shadow .2s, transform .2s; }
        .sv-card-wrap:hover { box-shadow: 0 10px 32px rgba(30,77,43,0.10); transform: translateY(-2px); }
        .sv-unsave-btn { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: ${RUST}; background: none; border: 1.5px solid rgba(181,40,28,0.18); border-radius: 999px; padding: 6px 14px; cursor: pointer; transition: all .2s; }
        .sv-unsave-btn:hover { background: rgba(181,40,28,0.06); border-color: ${RUST}; }
        .ft-grid { display: grid; grid-template-columns: 2.5fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 56px; }
        .hero-inner { display: flex; align-items: flex-end; justify-content: space-between; gap: 48px; }
        @media (max-width: 900px) {
          .ft-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .hero-inner { flex-direction: column; gap: 20px; align-items: flex-start; }
        }
        @media (max-width: 480px) {
          .ft-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <Header dict={dict} lang={lang} />

      {/* ── HERO ── */}
      <section style={{ position: "relative", height: "62vh", minHeight: 400, display: "flex", alignItems: "flex-end" }}>
        <img
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=88"
          alt=""
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 55%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,20,10,0.93) 0%, rgba(10,20,10,0.52) 50%, rgba(10,20,10,0.12) 100%)" }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 1100, margin: "0 auto", padding: "0 48px 72px", width: "100%" }}>
          {/* Label */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
            <HeartIcon filled size={18} color={RUST} />
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", margin: 0 }}>
              {fr ? "ÉVÉNEMENTS SAUVEGARDÉS" : "SAVED EVENTS"}
            </p>
          </div>

          {/* Heading + subtitle side by side */}
          <div className="hero-inner">
            <h1 style={{ fontSize: "clamp(48px, 7vw, 96px)", fontWeight: 900, lineHeight: 0.92, letterSpacing: "-3px", color: WHITE, margin: 0 }}>
              {fr ? "Événements\nsauvegardés." : "Saved\nevents."}
            </h1>
            <p style={{ fontSize: "clamp(15px, 1.5vw, 18px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.75, maxWidth: 300, margin: 0, paddingBottom: 8, borderLeft: "2px solid rgba(255,255,255,0.15)", paddingLeft: 28 }}>
              {fr
                ? "Vos événements favoris —\ntout en un seul endroit."
                : "Your favourite events —\nall in one place."}
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.3 }}>
          <div style={{ width: 1, height: 36, background: WHITE }} />
          <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "3px", color: WHITE, textTransform: "uppercase" }}>scroll</span>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 48px 100px" }}>

        {/* Loading */}
        {showLoading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: 14, color: "#bbb", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>
              {dict.saved.loading}
            </p>
          </div>
        )}

        {/* Empty state */}
        {showEmpty && (
          <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", padding: "24px 0 80px" }}>
            <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", height: 260, marginBottom: 48 }}>
              <img
                src="https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=900&q=80"
                alt=""
                aria-hidden="true"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "rgba(10,20,10,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(255,255,255,0.25)" }}>
                  <HeartIcon filled={false} size={30} color={WHITE} />
                </div>
              </div>
            </div>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 900, letterSpacing: "-1px", color: DARK, marginBottom: 14 }}>
              {dict.saved.empty}
            </h2>
            <p style={{ fontSize: 15, color: "#888", lineHeight: 1.8, maxWidth: 380, margin: "0 auto 36px" }}>
              {dict.saved.emptyHint}
            </p>
            <a
              href={`/${lang}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: GREEN_DARK, color: WHITE, borderRadius: 999, padding: "14px 36px", fontSize: 14, fontWeight: 800, textDecoration: "none", transition: "background .2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#163d21"; }}
              onMouseLeave={e => { e.currentTarget.style.background = GREEN_DARK; }}
            >
              {dict.saved.browse}
            </a>
          </div>
        )}

        {/* Saved events list */}
        {!showEmpty && !showLoading && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <HeartIcon filled size={16} color={RUST} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                  {saved.length} {fr ? (saved.length === 1 ? "événement sauvegardé" : "événements sauvegardés") : (saved.length === 1 ? "saved event" : "saved events")}
                </span>
              </div>
              <a href={`/${lang}`} style={{ fontSize: 13, fontWeight: 700, color: GREEN_MID, textDecoration: "none" }}
                onMouseEnter={e => { e.currentTarget.style.textDecoration = "underline"; }}
                onMouseLeave={e => { e.currentTarget.style.textDecoration = "none"; }}>
                {fr ? "+ Parcourir les événements" : "+ Browse more events"}
              </a>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {saved.map(event => (
                <div key={event.id} className="sv-card-wrap">
                  <div style={{ display: "flex", justifyContent: "flex-end", padding: "14px 20px 0" }}>
                    <button className="sv-unsave-btn" onClick={() => toggle(event.id)}>
                      <HeartIcon filled size={13} color={RUST} />
                      {fr ? "Retirer" : "Unsave"}
                    </button>
                  </div>
                  <EventCard
                    event={event}
                    lang={lang}
                    dict={dict}
                    saved
                    onToggleSave={() => toggle(event.id)}
                  />
                </div>
              ))}
            </div>

            <p style={{ fontSize: 11, color: "#bbb", textAlign: "center", marginTop: 48, lineHeight: 1.8 }}>
              {user ? dict.saved.noteAccount : dict.saved.note}
            </p>
          </>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: GREEN_DARK, color: WHITE, padding: "72px 48px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="ft-grid">
            <div>
              <img
                src="/MTLVerde_Logo.png"
                alt="MTLVerde"
                style={{ height: 72, marginBottom: 20, filter: "brightness(10)" }}
                onError={e => { e.currentTarget.style.display = "none"; }}
              />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, maxWidth: 280 }}>
                {fr
                  ? "Découvrir la vie communautaire à Montréal — gratuit, bilingue, et conçu pour les nouveaux arrivants."
                  : "Discover community life in Montreal — free, bilingual, and built for newcomers."}
              </p>
            </div>
            {[
              { heading: fr ? "Compagnie" : "Company", links: [fr ? "À propos" : "About", "Press", "Careers"] },
              { heading: "Contact",                     links: ["Help/FAQ", fr ? "Équipe" : "Team", "mtlverde@gmail.com"] },
              { heading: fr ? "Plus" : "More",          links: [fr ? "Données ouvertes" : "Open Data", fr ? "Accessibilité" : "Accessibility", fr ? "Confidentialité" : "Privacy"] },
            ].map(col => (
              <div key={col.heading}>
                <h4 style={{ fontSize: 11, fontWeight: 800, marginBottom: 20, color: "rgba(255,255,255,0.9)", letterSpacing: "1px", textTransform: "uppercase" }}>{col.heading}</h4>
                {col.links.map(l => (
                  <p key={l} style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 12, cursor: "pointer", transition: "color 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.color = WHITE; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
                    {l}
                  </p>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 28, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              © 2026 MTLVerde — {fr ? "Événements. Montréal. Ensemble." : "Events. Montreal. Together."}
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>mtlverde@gmail.com</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
