"use client";
import { useEffect, useState } from "react";
import Header from "../Header";
import EventCard from "../EventCard";
import { useBookmarks } from "@/lib/bookmarks";
import { API_BASE } from "@/lib/api";

const PINE  = "#1a2e1a";
const MOSS  = "#3d5a3e";
const SAGE  = "#7a9e7e";
const STONE = "#c8b89a";
const CREAM = "#f5f0e8";
const RUST  = "#a0522d";
const DARK  = "#0f1a0f";
const WHITE = "#ffffff";

function HeartIcon({ filled = false, size = 24, color = RUST }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? color : "none"}
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function SavedClient({ dict, lang }) {
  const [events, setEvents] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const { isSaved, toggle, count } = useBookmarks();

  useEffect(() => {
    fetch(`${API_BASE}/events/all`)
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(() => setEvents([]))
      .finally(() => setLoaded(true));
  }, []);

  const saved      = events.filter(e => isSaved(e.id));
  const showEmpty  = count === 0 || (loaded && saved.length === 0);
  const showLoading = count > 0 && !loaded && saved.length === 0;

  const fr = lang === "fr";

  return (
    <div style={{ fontFamily: "'DM Sans','Inter',sans-serif", background: CREAM, color: DARK, margin: 0, padding: 0 }}>

      <style>{`
        * { box-sizing: border-box; }
        .sv-card-wrap { background: ${WHITE}; border-radius: 18px; border: 1px solid rgba(0,0,0,0.06); overflow: hidden; transition: box-shadow .2s, transform .2s; }
        .sv-card-wrap:hover { box-shadow: 0 10px 32px rgba(26,46,26,0.10); transform: translateY(-2px); }
        .sv-unsave-btn { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: ${RUST}; background: none; border: 1.5px solid ${RUST}22; border-radius: 999px; padding: 6px 14px; cursor: pointer; transition: all .2s; }
        .sv-unsave-btn:hover { background: ${RUST}11; border-color: ${RUST}; }
        .fl { display: block; font-size: 13px; color: rgba(255,255,255,.4); margin-bottom: 12px; text-decoration: none; transition: color .2s; }
        .fl:hover { color: rgba(255,255,255,.85); }
        .ft-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
        @media (max-width: 768px) {
          .ft-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
        }
        @media (max-width: 480px) {
          .ft-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <Header dict={dict} lang={lang} />

      {/* ── HERO ── */}
      <section style={{ position: "relative", height: "52vh", minHeight: 340, display: "flex", alignItems: "flex-end" }}>
        <img
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=88"
          alt=""
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 55%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,20,10,0.92) 0%, rgba(10,20,10,0.45) 45%, rgba(10,20,10,0.08) 100%)" }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1100, margin: "0 auto", padding: "0 48px 64px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <HeartIcon filled size={28} color={RUST} />
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: SAGE, textTransform: "uppercase" }}>
              {fr ? "ÉVÉNEMENTS SAUVEGARDÉS" : "SAVED EVENTS"}
            </p>
          </div>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 80px)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-3px", color: WHITE, maxWidth: 640 }}>
            {dict.saved.heading}
          </h1>
        </div>
        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.35 }}>
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
            {/* Nature image behind empty state */}
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
            <p style={{ fontSize: 15, color: "#888", lineHeight: 1.8, marginBottom: 36, maxWidth: 380, margin: "0 auto 36px" }}>
              {dict.saved.emptyHint}
            </p>
            <a
              href={`/${lang}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: PINE, color: WHITE, borderRadius: 999, padding: "14px 36px", fontSize: 14, fontWeight: 800, textDecoration: "none", transition: "background .2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = MOSS; }}
              onMouseLeave={e => { e.currentTarget.style.background = PINE; }}
            >
              {dict.saved.browse}
            </a>
          </div>
        )}

        {/* Saved events list */}
        {!showEmpty && !showLoading && (
          <>
            {/* Count bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <HeartIcon filled size={18} color={RUST} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                  {saved.length} {fr ? (saved.length === 1 ? "événement sauvegardé" : "événements sauvegardés") : (saved.length === 1 ? "saved event" : "saved events")}
                </span>
              </div>
              <a href={`/${lang}`} style={{ fontSize: 13, fontWeight: 700, color: MOSS, textDecoration: "none" }}>
                {fr ? "+ Parcourir les événements" : "+ Browse more events"}
              </a>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {saved.map(event => (
                <div key={event.id} className="sv-card-wrap">
                  {/* Un-save button row */}
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
              {dict.saved.note}
            </p>
          </>
        )}
      </main>

      {/* ── FOOTER (matches MissionClient) ── */}
      <footer style={{ background: PINE, padding: "64px 8vw 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="ft-grid">
            <div>
              <img
                src="/MTLVerde_Logo.png"
                alt="MTLVerde"
                style={{ height: 120, marginBottom: 24, filter: "brightness(10)" }}
                onError={e => { e.currentTarget.style.display = "none"; }}
              />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 280 }}>
                {fr
                  ? "Découvrir la vie communautaire à Montréal — gratuit, bilingue."
                  : "Discover community life in Montreal — free, bilingual, built for newcomers."}
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: 10, fontWeight: 800, marginBottom: 20, color: "rgba(255,255,255,0.7)", letterSpacing: "2px", textTransform: "uppercase" }}>
                {fr ? "Compagnie" : "Company"}
              </h4>
              {(fr
                ? [["À propos", "#about"], ["Presse", "#press"], ["Carrières", "#careers"]]
                : [["About", "#about"], ["Press", "#press"], ["Careers", "#careers"]]
              ).map(([label, href]) => (
                <a key={label} href={`/${lang}${href}`} className="fl">{label}</a>
              ))}
            </div>
            <div>
              <h4 style={{ fontSize: 10, fontWeight: 800, marginBottom: 20, color: "rgba(255,255,255,0.7)", letterSpacing: "2px", textTransform: "uppercase" }}>Contact</h4>
              {[["Help / FAQ", "#faq"], ["Team", "#team"], ["mtlverde@gmail.com", "mailto:mtlverde@gmail.com"]].map(([label, href]) => (
                <a key={label} href={href.startsWith("mailto") ? href : `/${lang}${href}`} className="fl">{label}</a>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
              © 2026 MTLVerde — {fr ? "Événements. Montréal. Ensemble." : "Events. Montreal. Together."}
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>mtlverde@gmail.com</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
