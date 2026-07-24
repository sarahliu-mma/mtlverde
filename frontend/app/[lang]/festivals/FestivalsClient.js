"use client";
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

// Matches the event card's exact palette used on the home/saved pages, so
// festival cards look identical wherever they're rendered.
const CARD_GREEN_DARK  = "#1e4d2b";
const CARD_GREEN_MID   = "#6a9e5a";
const CARD_GREEN_LIGHT = "#e8f0e4";
const CARD_RED         = "#b5281c";
const CARD_RED_LIGHT   = "#fdf0ee";
const CARD_DARK        = "#111";

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

// The backend already filters /events to festivals that haven't ended, but it
// compares against its own server clock and a cached response can lag behind
// -- so filter again here against the browser's current date as a safety net
// against ever showing something that's already over.
function isUpcoming(event) {
  if (!event.date_fin) return true;
  return event.date_fin >= new Date().toISOString().slice(0, 10);
}

export default function FestivalsClient({ dict, lang }) {
  const [festivals, setFestivals] = useState([]);
  const [loaded, setLoaded]       = useState(false);
  const { isSaved, toggle } = useBookmarks();
  const fr = lang === "fr";
  const f = dict.festivals;

  useEffect(() => {
    // /events serves only the curated, hand-picked festivals -- not the full
    // public-data feed -- so this page stays a small, marquee list.
    fetch(`${API_BASE}/events`)
      .then((res) => res.json())
      .then((data) => setFestivals(data.filter(isUpcoming)))
      .catch(() => setFestivals([]))
      .finally(() => setLoaded(true));
  }, []);

  const showEmpty   = loaded && festivals.length === 0;
  const showLoading = !loaded;

  return (
    <div style={{ fontFamily: "'DM Sans','Inter',sans-serif", background: CREAM, color: DARK, margin: 0, padding: 0 }}>

      <style>{`
        * { box-sizing: border-box; }
        .festival-card { display: flex; border: 1px solid ${CARD_GREEN_LIGHT}; border-radius: 16px; overflow: hidden; transition: all 0.2s; background: #fff; }
        .festival-card:hover { border-color: ${CARD_GREEN_MID}; box-shadow: 0 4px 20px rgba(30,77,43,0.10); }
        .festival-card .thumb { width: 140px; min-width: 140px; overflow: hidden; flex-shrink: 0; }
        .festival-card .thumb img { width: 100%; height: 100%; object-fit: cover; min-height: 120px; }
        .festival-card .body { padding: 18px 22px; flex: 1; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; white-space: nowrap; }
        .badge-green  { background: ${CARD_GREEN_LIGHT}; color: ${CARD_GREEN_DARK}; }
        .badge-red    { background: ${CARD_RED_LIGHT};   color: ${CARD_RED};        }
        .badge-pink   { background: #fce7f3; color: #9d174d; }
        .festivals-grid { display: grid; gap: 14px; }
        @media (max-width: 768px) {
          .festival-card { flex-direction: column; }
          .festival-card .thumb { width: 100%; min-width: unset; height: 150px; }
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
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 48px 100px" }}>

        {/* Loading */}
        {showLoading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: 14, color: "#999", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>
              {f.loading}
            </p>
          </div>
        )}

        {/* Empty state (feed unreachable) */}
        {showEmpty && (
          <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", padding: "24px 0 80px" }}>
            <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 900, letterSpacing: "-1px", color: DARK, marginBottom: 14 }}>
              {f.empty}
            </h2>
            <p style={{ fontSize: 15, color: "#888", lineHeight: 1.8 }}>
              {f.emptyHint}
            </p>
          </div>
        )}

        {!showLoading && !showEmpty && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                {(f.count || "{count} festivals").replace("{count}", festivals.length)}
              </span>
            </div>

            <div className="festivals-grid">
              {festivals.map((event) => (
                <div key={event.id} className="festival-card">
                  <div className="thumb">
                    <img src={getEventPhoto(event.type_evenement)} alt={event.type_evenement} />
                  </div>
                  <div className="body">
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 10, color: CARD_GREEN_MID, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 5 }}>{tField("type_evenement", event.type_evenement, lang)}</p>
                      <h2 style={{ fontSize: 17, fontWeight: 800, color: CARD_DARK, marginBottom: 4, lineHeight: 1.3 }}>{eventTitle(event, lang)}</h2>
                      <p style={{ fontSize: 12, color: "#888", marginBottom: 3 }}>{event.arrondissement}</p>
                      <p style={{ fontSize: 11, color: "#ccc", marginBottom: 8 }}>{event.date_debut} → {event.date_fin}</p>
                      <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 10 }}>{eventDescription(event, lang)}</p>
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
                      {event.badge && (
                        <span
                          className="badge"
                          title={dict.badge?.learnMore ?? "How we score"}
                          style={{ background: (BADGE_STYLE[event.badge] || {}).bg || "#eee", color: (BADGE_STYLE[event.badge] || {}).color || "#666" }}
                        >
                          {event.badge_icon} {dict.badge?.[BADGE_KEY[event.badge]] ?? event.badge}
                        </span>
                      )}
                      {event.public_cible && <span className="badge badge-pink">{tField("public_cible", event.public_cible, lang)}</span>}
                      <span className={`badge ${event.cout === "Gratuit" ? "badge-green" : "badge-red"}`}>
                        {tField("cout", event.cout, lang)}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggle(event.id)}
                        aria-label={isSaved(event.id) ? (dict.event?.unsave || "Remove from saved") : (dict.event?.save || "Save event")}
                        aria-pressed={isSaved(event.id)}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", marginTop: "auto" }}
                      >
                        <HeartIcon filled={isSaved(event.id)} size={20} color={CARD_RED} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* ── FOOTER (matches SavedClient/MissionClient) ── */}
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
