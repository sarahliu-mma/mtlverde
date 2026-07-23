"use client";
import { useEffect, useState } from "react";
import Header from "../Header";
import { useBookmarks } from "@/lib/bookmarks";
import { useAuth } from "../AuthProvider";
import { API_BASE } from "@/lib/api";
import { tField, eventDescription } from "../eventData";
import { getEventPhoto } from "@/lib/eventPhotos";

const PINE  = "#1a2e1a";
const MOSS  = "#3d5a3e";
const SAGE  = "#7a9e7e";
const STONE = "#c8b89a";
const CREAM = "#f5f0e8";
const RUST  = "#a0522d";
const DARK  = "#0f1a0f";
const WHITE = "#ffffff";

// Matches the event card's exact palette on the home page (HomeClient.js), so
// the card looks identical wherever it's rendered -- kept separate from this
// page's PINE/MOSS/RUST hero and footer palette.
const CARD_GREEN_DARK  = "#1e4d2b";
const CARD_GREEN_MID   = "#6a9e5a";
const CARD_GREEN_LIGHT = "#e8f0e4";
const CARD_RED         = "#b5281c";
const CARD_RED_LIGHT   = "#fdf0ee";
const CARD_DARK        = "#111";

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
  const { user } = useAuth();

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
        .event-list-card { display: flex; border: 1px solid ${CARD_GREEN_LIGHT}; border-radius: 16px; overflow: hidden; transition: all 0.2s; background: #fff; }
        .event-list-card:hover { border-color: ${CARD_GREEN_MID}; box-shadow: 0 4px 20px rgba(30,77,43,0.10); }
        .event-list-card .thumb { width: 100px; min-width: 100px; overflow: hidden; flex-shrink: 0; }
        .event-list-card .thumb img { width: 100%; height: 100%; object-fit: cover; min-height: 100px; }
        .event-list-card .body { padding: 16px 20px; flex: 1; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; white-space: nowrap; }
        .badge-green  { background: ${CARD_GREEN_LIGHT}; color: ${CARD_GREEN_DARK}; }
        .badge-red    { background: ${CARD_RED_LIGHT};   color: ${CARD_RED};        }
        .badge-pink   { background: #fce7f3; color: #9d174d; }
        @media (max-width: 768px) {
          .event-list-card { flex-direction: column; }
          .event-list-card .thumb { width: 100%; min-width: unset; height: 140px; }
        }
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
                <div key={event.id} className="event-list-card">
                  <div className="thumb">
                    <img src={getEventPhoto(event.type_evenement)} alt={event.type_evenement} />
                  </div>
                  <div className="body">
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 10, color: CARD_GREEN_MID, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 5 }}>{tField("type_evenement", event.type_evenement, lang)}</p>
                      <h2 style={{ fontSize: 15, fontWeight: 800, color: CARD_DARK, marginBottom: 4, lineHeight: 1.3 }}>{lang === "fr" ? event.titre : (event.titre_en || event.titre)}</h2>
                      <p style={{ fontSize: 12, color: "#888", marginBottom: 3 }}>{event.arrondissement}</p>
                      <p style={{ fontSize: 11, color: "#ccc", marginBottom: 8 }}>{event.date_debut} → {event.date_fin}</p>
                      <p style={{ fontSize: 12, color: "#666", lineHeight: 1.6, marginBottom: 10 }}>{eventDescription(event, lang)}</p>
                      {event.url_fiche && (
                        <a href={event.url_fiche} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 12, fontWeight: 700, color: CARD_GREEN_DARK, textDecoration: "none" }}
                          onMouseEnter={e => { e.currentTarget.style.textDecoration = "underline"; }}
                          onMouseLeave={e => { e.currentTarget.style.textDecoration = "none"; }}>
                          {dict.event?.readMore || "Read more"} →
                        </a>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, alignItems: "flex-end", alignSelf: "stretch" }}>
                      {event.public_cible   && <span className="badge badge-pink">{tField("public_cible", event.public_cible, lang)}</span>}
                      <span className={`badge ${event.cout === "Gratuit" ? "badge-green" : "badge-red"}`}>
                        {tField("cout", event.cout, lang)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggle(event.id); }}
                        aria-label={isSaved(event.id) ? (dict.event?.unsave || "Remove from saved") : (dict.event?.save || "Save event")}
                        aria-pressed={isSaved(event.id)}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: CARD_RED, display: "flex", marginTop: "auto" }}
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill={isSaved(event.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 11, color: "#bbb", textAlign: "center", marginTop: 48, lineHeight: 1.8 }}>
              {user ? dict.saved.noteAccount : dict.saved.note}
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
