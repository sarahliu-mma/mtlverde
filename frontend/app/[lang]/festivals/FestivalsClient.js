"use client";
// frontend/app/[lang]/festivals/FestivalsClient.js
import { useEffect, useState } from "react";
import Header from "../Header";
import { useBookmarks } from "@/lib/bookmarks";
import { API_BASE } from "@/lib/api";
import { tField, eventTitle, eventDescription } from "../eventData";
import { getEventPhoto } from "@/lib/eventPhotos";

const PINE  = "#1a2e1a";
const MOSS  = "#3d5a3e";
const SAGE  = "#7a9e7e";
const STONE = "#c8b89a";
const CREAM = "#f5f0e8";
const RUST  = "#a0522d";
const DARK  = "#0f1a0f";
const WHITE = "#ffffff";

const CARD_GREEN_DARK  = "#1e4d2b";
const CARD_GREEN_MID   = "#6a9e5a";
const CARD_GREEN_LIGHT = "#e8f0e4";
const CARD_RED         = "#b5281c";
const CARD_RED_LIGHT   = "#fdf0ee";

const BADGE_KEY = {
  "Green Leader": "greenLeader",
  "Eco-Friendly": "ecoFriendly",
  "Getting There": "gettingThere",
};

const BADGE_STYLE = {
  "Green Leader":  { bg: "#d4e8d4", color: MOSS      },
  "Eco-Friendly":  { bg: "#e8f0e4", color: "#4a7a4a" },
  "Getting There": { bg: "#f0e8dc", color: "#7a5a2a" },
};

// Fallback nature photo pool for cards without a specific photo
const CARD_PHOTOS = [
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80",
  "https://images.unsplash.com/photo-1511497584788-876760111969?w=600&q=80",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600&q=80",
  "https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=600&q=80",
  "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&q=80",
];

function HeartIcon({ filled = false, size = 20, color = RUST }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}
      fill={filled ? color : "none"} stroke={color}
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function isUpcoming(event) {
  if (!event.date_fin) return true;
  return event.date_fin >= new Date().toISOString().slice(0, 10);
}

export default function FestivalsClient({ dict, lang }) {
  const [festivals, setFestivals] = useState([]);
  const [loaded, setLoaded]       = useState(false);
  const [openId, setOpenId]       = useState(null);
  const { isSaved, toggle } = useBookmarks();
  const fr = lang === "fr";
  const f = dict.festivals;

  useEffect(() => {
    fetch(`${API_BASE}/events`)
      .then((res) => res.json())
      .then((data) => setFestivals(
        data.filter(isUpcoming).sort((a, b) => (a.date_debut || "").localeCompare(b.date_debut || ""))
      ))
      .catch(() => setFestivals([]))
      .finally(() => setLoaded(true));
  }, []);

  const openEvent = festivals.find((e) => e.id === openId) || null;
  const showEmpty   = loaded && festivals.length === 0;
  const showLoading = !loaded;

  return (
    <div style={{ fontFamily: "'DM Sans','Inter',sans-serif", background: CREAM, color: DARK, margin: 0, padding: 0 }}>
      <style>{`
        * { box-sizing: border-box; }
        .fest-scroll::-webkit-scrollbar { height: 4px; }
        .fest-scroll::-webkit-scrollbar-track { background: transparent; }
        .fest-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 2px; }
        .fest-card { position: relative; border-radius: 18px; overflow: hidden; cursor: pointer; flex-shrink: 0; transition: transform 0.22s, box-shadow 0.22s; }
        .fest-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(0,0,0,0.18); }
        .fest-card:hover .fest-img { transform: scale(1.06); }
        .fest-img { transition: transform 0.5s ease; width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
        .fest-card-active { outline: 3px solid ${SAGE}; outline-offset: 3px; transform: translateY(-5px); box-shadow: 0 16px 40px rgba(0,0,0,0.22); }
        .fl { display: block; font-size: 13px; color: rgba(255,255,255,.4); margin-bottom: 12px; text-decoration: none; transition: color .2s; }
        .fl:hover { color: rgba(255,255,255,.85); }
        .ft-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
        @media (max-width: 768px) { .ft-grid { grid-template-columns: 1fr 1fr; gap: 32px; } }
        @media (max-width: 480px) { .ft-grid { grid-template-columns: 1fr; } }
        .detail-bar { animation: slideDown 0.28s ease; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <Header dict={dict} lang={lang} />

      {/* ── HERO ── */}
      <section style={{ position: "relative", height: "52vh", minHeight: 380, display: "flex", alignItems: "flex-end" }}>
        <img
          src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600&q=88"
          alt=""
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 45%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,20,10,0.92) 0%, rgba(10,20,10,0.45) 45%, rgba(10,20,10,0.08) 100%)" }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1100, margin: "0 auto", padding: "0 48px 64px", width: "100%" }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: SAGE, textTransform: "uppercase", marginBottom: 14 }}>
            {fr ? "MTLVERDE · SÉLECTION" : "MTLVERDE · CURATED"}
          </p>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 80px)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-3px", color: WHITE, maxWidth: 700, marginBottom: 20 }}>
            {f.heading}
          </h1>
          <p style={{ fontSize: "clamp(14px, 1.6vw, 18px)", color: "rgba(255,255,255,0.7)", lineHeight: 1.8, maxWidth: 560 }}>
            {f.intro}
          </p>
        </div>
        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.35 }}>
          <div style={{ width: 1, height: 36, background: WHITE }} />
          <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "3px", color: WHITE, textTransform: "uppercase" }}>scroll</span>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main style={{ padding: "64px 0 100px" }}>

        {showLoading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: 14, color: "#999", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>{f.loading}</p>
          </div>
        )}

        {showEmpty && (
          <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", padding: "24px 48px 80px" }}>
            <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 900, letterSpacing: "-1px", color: DARK, marginBottom: 14 }}>{f.empty}</h2>
            <p style={{ fontSize: 15, color: "#888", lineHeight: 1.8 }}>{f.emptyHint}</p>
          </div>
        )}

        {!showLoading && !showEmpty && (
          <>
            {/* Count + label */}
            <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 48px 20px", display: "flex", alignItems: "baseline", gap: 12 }}>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 900, letterSpacing: "-1px", color: DARK, margin: 0 }}>
                {fr ? "Festivals à l'affiche" : "Featured Festivals"}
              </h2>
              <span style={{ fontSize: 14, color: "#aaa", fontWeight: 600 }}>{festivals.length} {fr ? "événements" : "events"}</span>
            </div>

            {/* ── Horizontal scroll row ── */}
            <div className="fest-scroll" style={{ overflowX: "auto", paddingBottom: 8 }}>
              <div style={{ display: "flex", gap: 16, padding: "8px 48px 16px", width: "max-content" }}>
                {festivals.map((event, i) => {
                  const isOpen = openId === event.id;
                  const photo  = getEventPhoto(event.type_evenement) || CARD_PHOTOS[i % CARD_PHOTOS.length];
                  const badge  = BADGE_STYLE[event.badge];

                  return (
                    <button
                      key={event.id}
                      type="button"
                      className={"fest-card" + (isOpen ? " fest-card-active" : "")}
                      onClick={() => setOpenId(isOpen ? null : event.id)}
                      aria-expanded={isOpen}
                      style={{ width: 280, height: 380, border: "none", padding: 0, background: "none", textAlign: "left" }}
                    >
                      {/* Background photo */}
                      <img className="fest-img" src={photo} alt="" aria-hidden="true" />

                      {/* Gradient overlay */}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,12,5,0.95) 0%, rgba(5,12,5,0.5) 45%, rgba(5,12,5,0.08) 100%)" }} />

                      {/* Top: badge */}
                      <div style={{ position: "absolute", top: 16, left: 16, right: 16 }}>
                        {event.badge && (
                          <span style={{ fontSize: 9, fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,0.15)", color: WHITE, letterSpacing: "0.5px", backdropFilter: "blur(4px)" }}>
                            {dict.badge?.[BADGE_KEY[event.badge]] ?? event.badge}
                          </span>
                        )}
                      </div>

                      {/* Bottom: info */}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 20px 22px" }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: SAGE, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 6 }}>
                          {tField("type_evenement", event.type_evenement, lang)}
                        </p>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: WHITE, lineHeight: 1.2, letterSpacing: "-0.5px", marginBottom: 8 }}>
                          {eventTitle(event, lang)}
                        </h3>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
                          {event.arrondissement}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.3px" }}>
                            {fr ? "Voir les détails" : "See details"} {isOpen ? "↑" : "↓"}
                          </span>
                          <span style={{
                            fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 999,
                            background: event.cout === "Gratuit" ? "rgba(100,190,100,0.25)" : "rgba(200,80,80,0.25)",
                            color: event.cout === "Gratuit" ? "#7eda7e" : "#f08080",
                          }}>
                            {tField("cout", event.cout, lang)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Expanded detail panel ── */}
            {openEvent && (
              <div className="detail-bar" style={{ maxWidth: 1400, margin: "8px auto 0", padding: "0 48px" }}>
                <div style={{ background: WHITE, borderRadius: 20, border: "1.5px solid #e0d8cc", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {/* Photo */}
                    <div style={{ flex: "0 0 320px", minHeight: 280, position: "relative", overflow: "hidden" }}>
                      <img
                        src={getEventPhoto(openEvent.type_evenement) || CARD_PHOTOS[festivals.indexOf(openEvent) % CARD_PHOTOS.length]}
                        alt=""
                        aria-hidden="true"
                        style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(5,12,5,0.0) 60%, rgba(255,255,255,1) 100%)" }} />
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, padding: "32px 36px 32px 28px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
                          <div>
                            <p style={{ fontSize: 10, fontWeight: 700, color: SAGE, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 6 }}>
                              {tField("type_evenement", openEvent.type_evenement, lang)}
                            </p>
                            <h2 style={{ fontSize: "clamp(20px, 2.5vw, 32px)", fontWeight: 900, color: DARK, letterSpacing: "-1px", lineHeight: 1.1, margin: 0 }}>
                              {eventTitle(openEvent, lang)}
                            </h2>
                          </div>
                          <button
                            type="button"
                            onClick={() => setOpenId(null)}
                            style={{ background: "#f0ebe4", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 18, color: "#999", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                            aria-label="Close"
                          >×</button>
                        </div>

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                          {openEvent.badge && (
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: (BADGE_STYLE[openEvent.badge] || {}).bg || "#eee", color: (BADGE_STYLE[openEvent.badge] || {}).color || "#666" }}>
                              {dict.badge?.[BADGE_KEY[openEvent.badge]] ?? openEvent.badge}
                            </span>
                          )}
                          {openEvent.public_cible && (
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: "#fce7f3", color: "#9d174d" }}>
                              {tField("public_cible", openEvent.public_cible, lang)}
                            </span>
                          )}
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: openEvent.cout === "Gratuit" ? CARD_GREEN_LIGHT : CARD_RED_LIGHT, color: openEvent.cout === "Gratuit" ? CARD_GREEN_DARK : CARD_RED }}>
                            {tField("cout", openEvent.cout, lang)}
                          </span>
                        </div>

                        <div style={{ display: "flex", gap: 24, marginBottom: 16, flexWrap: "wrap" }}>
                          <div>
                            <p style={{ fontSize: 10, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 3 }}>{fr ? "Lieu" : "Location"}</p>
                            <p style={{ fontSize: 14, color: DARK, fontWeight: 600 }}>{openEvent.arrondissement}</p>
                          </div>
                          {(openEvent.date_debut || openEvent.date_fin) && (
                            <div>
                              <p style={{ fontSize: 10, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 3 }}>{fr ? "Dates" : "Dates"}</p>
                              <p style={{ fontSize: 14, color: DARK, fontWeight: 600 }}>{openEvent.date_debut} → {openEvent.date_fin}</p>
                            </div>
                          )}
                        </div>

                        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.8, marginBottom: 20 }}>
                          {eventDescription(openEvent, lang)}
                        </p>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {openEvent.url_fiche && (
                          <a
                            href={openEvent.url_fiche}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 13, fontWeight: 800, color: WHITE, background: PINE, padding: "10px 22px", borderRadius: 12, textDecoration: "none", letterSpacing: "0.2px" }}
                          >
                            {dict.event?.readMore || "Read more"} →
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => toggle(openEvent.id)}
                          aria-pressed={isSaved(openEvent.id)}
                          style={{ background: "none", border: "1.5px solid #e0d8cc", borderRadius: 12, padding: "9px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                        >
                          <HeartIcon filled={isSaved(openEvent.id)} size={18} color={RUST} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#888" }}>
                            {isSaved(openEvent.id) ? (dict.event?.unsave || "Saved") : (dict.event?.save || "Save")}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: PINE, padding: "64px 8vw 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="ft-grid">
            <div>
              <img
                src="/MTLVerde_Logo.png"
                alt="MTLVerde"
                style={{ height: 120, marginBottom: 24, filter: "brightness(10)" }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
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
