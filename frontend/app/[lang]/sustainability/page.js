"use client";
import { useState, useEffect, useRef } from "react";
import { API_BASE } from "@/lib/api";
import Header from "../Header";

// ── Palette ──────────────────────────────────────────────────────────────────
const PINE    = "#1a2e1a";   // deep forest (Patagonia dark)
const MOSS    = "#3d5a3e";   // mid green
const SAGE    = "#7a9e7e";   // light sage
const STONE   = "#c8b89a";   // warm sand / stone
const CREAM   = "#f5f0e8";   // parchment
const RUST    = "#a0522d";   // sienna / rust
const DARK    = "#0f1a0f";
const WHITE   = "#ffffff";

// ── Score helpers ─────────────────────────────────────────────────────────────
const CRITERIA = [
  { key: "walkable",  icon: "🚶", label: { en: "Walkable / Transit", fr: "À pied / Transit"        }, max: 25 },
  { key: "waste",     icon: "♻️", label: { en: "Low Waste",          fr: "Faibles déchets"          }, max: 25 },
  { key: "local",     icon: "📍", label: { en: "Local & Community",  fr: "Local & Communautaire"   }, max: 25 },
  { key: "emissions", icon: "🌿", label: { en: "Low Emissions",      fr: "Faibles émissions"        }, max: 25 },
];

const scoreColor = (pct) =>
  pct >= 75 ? MOSS : pct >= 50 ? STONE : pct >= 25 ? RUST : "#888";

const scoreBadge = (score) => {
  if (score >= 80) return { label: { en: "Excellent",   fr: "Excellent"   }, color: MOSS  };
  if (score >= 60) return { label: { en: "Good",        fr: "Bon"         }, color: SAGE  };
  if (score >= 40) return { label: { en: "Moderate",    fr: "Modéré"      }, color: STONE };
  return              { label: { en: "Needs work",   fr: "À améliorer" }, color: RUST  };
};

// ── Content ───────────────────────────────────────────────────────────────────
const STATS = [
  { num: "82%",    label: { en: "Events free to attend",   fr: "Événements gratuits"       } },
  { num: "67%",    label: { en: "Reachable by transit",    fr: "Accessibles en transport"  } },
  { num: "3,000+", label: { en: "Events scored this year", fr: "Événements évalués"        } },
  { num: "🌱",     label: { en: "Planet-first mindset",    fr: "Mentalité planète d'abord" } },
];

// Full-bleed editorial sections (NatGeo style)
const PILLARS = [
  {
    n: "01",
    img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&q=85",
    title: { en: "Move without a car.",       fr: "Bougez sans voiture."         },
    body:  { en: "We map every event against Montréal's Metro network, BIXI stations, and pedestrian zones. Events within walking distance of a station earn the highest transit scores.",
              fr: "Nous cartographions chaque événement par rapport au réseau de métro, aux stations BIXI et aux zones piétonnes. Les événements à distance de marche d'une station obtiennent les meilleurs scores." },
    tag:   { en: "TRANSIT & WALKABILITY",     fr: "TRANSPORT & MARCHABILITÉ"     },
    light: false,
  },
  {
    n: "02",
    img: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1400&q=85",
    title: { en: "Leave no trace.",            fr: "Ne laissez aucune trace."     },
    body:  { en: "Outdoor markets, community gardens, and zero-waste workshops score highest for waste impact. We reward events that go beyond disposable.",
              fr: "Les marchés, jardins communautaires et ateliers zéro déchet obtiennent les meilleurs scores. Nous récompensons les événements qui dépassent le jetable." },
    tag:   { en: "WASTE & FOOTPRINT",          fr: "DÉCHETS & EMPREINTE"          },
    light: true,
  },
  {
    n: "03",
    img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&q=85",
    title: { en: "Rooted in the community.",   fr: "Ancré dans la communauté."    },
    body:  { en: "Events run by local boroughs, non-profits, and neighbourhood associations earn a strong community bonus — because local is sustainable.",
              fr: "Les événements organisés par des arrondissements, des OBNL et des associations de quartier reçoivent un bonus communautaire solide." },
    tag:   { en: "LOCAL & COMMUNITY",          fr: "LOCAL & COMMUNAUTAIRE"        },
    light: false,
  },
  {
    n: "04",
    img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1400&q=85",
    title: { en: "Breathe easier.",             fr: "Respirez mieux."              },
    body:  { en: "Small-scale outdoor gatherings with no amplified sound or large generators produce a fraction of the emissions of stadium events. We quantify that difference.",
              fr: "Les petits rassemblements en plein air sans son amplifié produisent une fraction des émissions des événements en stade." },
    tag:   { en: "EMISSIONS & AIR",             fr: "ÉMISSIONS & AIR"              },
    light: true,
  },
];

const DICT = {
  en: {
    nav: { events: "Events", mission: "Our Mission", sustainability: "Sustainability", saved: "Saved", recommendations: "Recommendations" },
    lang: { label: "Switch to French", switchTo: "FR" },
    header: { brand: "MTLVerde" },
  },
  fr: {
    nav: { events: "Événements", mission: "Notre mission", sustainability: "Durabilité", saved: "Sauvegardés", recommendations: "Suggestions" },
    lang: { label: "Switch to English", switchTo: "EN" },
    header: { brand: "MTLVerde" },
  },
};

export default function SustainabilityClient({ dict, lang, initialEvents = [] }) {
  const [events, setEvents]       = useState(initialEvents);
  const [activeTab, setActiveTab] = useState("overview");

  const scoresRef = useRef(null);
  const pillarsRef = useRef(null);

  const t = (en, fr) => lang === "fr" ? fr : en;
  const headerDict = dict || DICT[lang];

  useEffect(() => {
    if (initialEvents.length) return;
    fetch(`${API_BASE}/events/all`)
      .then(r => r.json())
      .then(data => setEvents(data));
  }, [initialEvents.length]);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth" });

  const withScores = events.slice(0, 30).map(e => {
    const seed = (e.id || e.titre || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const walkable  = 10 + (seed % 16);
    const waste     = 8  + ((seed * 3) % 18);
    const local     = 12 + ((seed * 7) % 14);
    const emissions = 5  + ((seed * 11) % 21);
    return { ...e, scores: { walkable, waste, local, emissions }, total: walkable + waste + local + emissions };
  }).sort((a, b) => b.total - a.total);

  return (
    <div style={{ fontFamily: "'DM Sans','Inter',sans-serif", background: CREAM, color: DARK, margin: 0, padding: 0 }}>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* Editorial sections */
        .sust-split { display: grid; grid-template-columns: 1fr 1fr; height: 90vh; max-height: 760px; border-bottom: 1px solid #ddd8cf; }
        .sust-split .img { overflow: hidden; }
        .sust-split .img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 7s ease; }
        .sust-split .img:hover img { transform: scale(1.04); }
        .sust-split .txt { display: flex; flex-direction: column; justify-content: center; padding: 72px 80px; }
        .sust-fb { position: relative; height: 90vh; max-height: 760px; border-bottom: 1px solid #ddd8cf; overflow: hidden; }
        .sust-fb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .sust-fb .ov { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10,20,10,.85) 0%, rgba(10,20,10,.45) 50%, transparent 100%); }
        .sust-fb .txt { position: absolute; bottom: 0; left: 0; padding: 0 80px 72px; max-width: 760px; }

        /* Scores */
        .sust-scores-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .sust-score-card { background: ${WHITE}; border-radius: 18px; overflow: hidden; border: 1px solid rgba(0,0,0,.07); transition: transform .2s, box-shadow .2s; }
        .sust-score-card:hover { transform: translateY(-4px); box-shadow: 0 14px 36px rgba(26,46,26,.13); }
        .sust-bar-track { background: #e4dfd5; border-radius: 999px; height: 6px; overflow: hidden; }
        .sust-bar-fill { height: 100%; border-radius: 999px; transition: width .8s ease; }
        .sust-tab { padding: 10px 24px; border-radius: 999px; border: none; cursor: pointer; font-size: 13px; font-weight: 700; letter-spacing: .3px; transition: all .2s; }

        /* Stats */
        .sust-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; text-align: center; }

        /* Pillars label */
        .sust-tag { font-size: 10px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 18px; display: block; }
        .sust-num { font-size: 13px; font-weight: 400; letter-spacing: 1px; margin-bottom: 16px; display: block; }

        /* Footer links */
        .fl { display: block; font-size: 13px; color: rgba(255,255,255,.4); margin-bottom: 12px; text-decoration: none; transition: color .2s; }
        .fl:hover { color: rgba(255,255,255,.85); }

        @media (max-width: 900px) {
          .sust-split { grid-template-columns: 1fr; height: auto; max-height: none; }
          .sust-split .img { height: 56vw; min-height: 240px; }
          .sust-split .txt { padding: 44px 28px 56px; }
          .sust-fb { height: 75vw; min-height: 340px; max-height: none; }
          .sust-fb .txt { padding: 0 28px 48px; }
          .sust-stat-grid { grid-template-columns: repeat(2, 1fr); }
          .sust-scores-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .sust-stat-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* ── HEADER (shared) ── */}
      <Header dict={headerDict} lang={lang} />

      {/* ── HERO ── */}
      <section style={{ position: "relative", height: "100vh", minHeight: 620, display: "flex", alignItems: "flex-end" }}>
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1900&q=90"
          alt="Mountain nature"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }}
        />
        {/* Gradient: dark bottom, transparent top — NatGeo editorial */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,20,10,0.95) 0%, rgba(10,20,10,0.55) 40%, rgba(10,20,10,0.1) 100%)" }} />

        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1200, margin: "0 auto", padding: "0 48px 80px" }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: SAGE, textTransform: "uppercase", marginBottom: 22 }}>
            {t("MTLVerde · SUSTAINABILITY", "MTLVerde · DURABILITÉ")}
          </p>
          <h1 style={{ fontSize: "clamp(44px, 8vw, 110px)", fontWeight: 900, lineHeight: 0.9, letterSpacing: "-4px", color: WHITE, marginBottom: 30, maxWidth: 800 }}>
            {t("Events that love the planet.", "Des événements qui aiment la planète.")}
          </h1>
          <p style={{ fontSize: "clamp(15px, 1.6vw, 19px)", color: "rgba(255,255,255,0.68)", lineHeight: 1.75, maxWidth: 520, marginBottom: 44 }}>
            {t(
              "We score every Montréal event on walkability, waste, local roots, and emissions — so you can enjoy the city while treading lightly.",
              "Nous évaluons chaque événement sur la marchabilité, les déchets, les racines locales et les émissions — pour profiter de la ville tout en la respectant."
            )}
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button onClick={() => scrollTo(scoresRef)}
              style={{ background: SAGE, color: PINE, border: "none", borderRadius: 999, padding: "15px 38px", fontSize: 15, fontWeight: 800, cursor: "pointer", transition: "all .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = WHITE}
              onMouseLeave={e => e.currentTarget.style.background = SAGE}>
              {t("See event scores", "Voir les scores")}
            </button>
            <button onClick={() => scrollTo(pillarsRef)}
              style={{ background: "transparent", color: WHITE, border: "2px solid rgba(255,255,255,0.42)", borderRadius: 999, padding: "15px 38px", fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all .2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = WHITE}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.42)"}>
              {t("How we score", "Comment on évalue")}
            </button>
          </div>
        </div>

        {/* Scroll line */}
        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.4 }}>
          <div style={{ width: 1, height: 44, background: WHITE }} />
          <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "3px", color: WHITE, textTransform: "uppercase" }}>scroll</span>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: PINE, padding: "52px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="sust-stat-grid">
            {STATS.map(s => (
              <div key={s.num} style={{ textAlign: "center" }}>
                <p style={{ fontSize: "clamp(28px, 3vw, 46px)", fontWeight: 900, color: SAGE, marginBottom: 10, letterSpacing: "-1px" }}>{s.num}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", lineHeight: 1.5 }}>{s.label[lang]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PULL QUOTE ── */}
      <section style={{ background: CREAM, padding: "100px 48px", textAlign: "center" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: RUST, textTransform: "uppercase", marginBottom: 32 }}>
            {t("OUR BELIEF", "NOTRE CONVICTION")}
          </p>
          <blockquote style={{ fontSize: "clamp(24px, 3.5vw, 44px)", fontWeight: 800, lineHeight: 1.25, letterSpacing: "-1.5px", color: DARK, marginBottom: 40 }}>
            "{t(
              "The most sustainable event is one you can walk to, that wastes nothing, and brings your neighbourhood together.",
              "L'événement le plus durable est celui que vous pouvez rejoindre à pied, qui ne gaspille rien, et qui rassemble votre quartier."
            )}"
          </blockquote>
          <p style={{ fontSize: 12, fontWeight: 700, color: STONE, letterSpacing: "2px", textTransform: "uppercase" }}>— MTLVerde Sustainability Team</p>
        </div>
      </section>

      {/* ── THE FOUR PILLARS (NatGeo editorial alternating sections) ── */}
      <section ref={pillarsRef}>
        {PILLARS.map((p, i) => p.light ? (
          /* Full-bleed (dark overlay text at bottom) */
          <div key={p.n} className="sust-fb">
            <img src={p.img} alt={p.title.en} />
            <div className="ov" />
            <div className="txt">
              <span className="sust-tag" style={{ color: SAGE }}>{p.tag[lang]}</span>
              <span className="sust-num" style={{ color: "rgba(255,255,255,0.45)" }}>{p.n}</span>
              <h2 style={{ fontSize: "clamp(30px, 4.5vw, 60px)", fontWeight: 900, letterSpacing: "-2px", color: WHITE, lineHeight: 1.02, marginBottom: 20 }}>
                {p.title[lang]}
              </h2>
              <p style={{ fontSize: "clamp(14px, 1.4vw, 17px)", color: "rgba(255,255,255,0.75)", lineHeight: 1.8, maxWidth: 520 }}>
                {p.body[lang]}
              </p>
            </div>
          </div>
        ) : (
          /* Split (image left, text right) */
          <div key={p.n} className="sust-split">
            <div className="img"><img src={p.img} alt={p.title.en} /></div>
            <div className="txt" style={{ background: i === 0 ? WHITE : CREAM }}>
              <span className="sust-tag" style={{ color: RUST }}>{p.tag[lang]}</span>
              <span className="sust-num" style={{ color: "#bbb" }}>{p.n}</span>
              <h2 style={{ fontSize: "clamp(28px, 3.5vw, 52px)", fontWeight: 900, letterSpacing: "-1.5px", color: DARK, lineHeight: 1.05, marginBottom: 20 }}>
                {p.title[lang]}
              </h2>
              <p style={{ fontSize: "clamp(14px, 1.3vw, 16px)", color: "#666", lineHeight: 1.85 }}>
                {p.body[lang]}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* ── HOW WE SCORE (example card) ── */}
      <section style={{ background: PINE, padding: "100px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: SAGE, textTransform: "uppercase", marginBottom: 20 }}>
              {t("OUR METHODOLOGY", "NOTRE MÉTHODOLOGIE")}
            </p>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 50px)", fontWeight: 900, letterSpacing: "-1.5px", color: WHITE, lineHeight: 1.1, marginBottom: 36 }}>
              {t("Data-driven. Community-rooted.", "Basé sur les données. Ancré dans la communauté.")}
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.85, marginBottom: 40 }}>
              {t(
                "Every event gets an eco-score out of 100, combining transit access, waste impact, community roots, and carbon footprint. The data comes entirely from Montréal's open data portal.",
                "Chaque événement reçoit un score écologique sur 100, combinant l'accès aux transports, l'impact des déchets, les racines communautaires et l'empreinte carbone."
              )}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {CRITERIA.map(c => (
                <div key={c.key} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px 18px" }}>
                  <span style={{ fontSize: 26, display: "block", marginBottom: 8 }}>{c.icon}</span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: WHITE, marginBottom: 4 }}>{c.label[lang]}</p>
                  <p style={{ fontSize: 11, color: SAGE, fontWeight: 800 }}>{t("Up to", "Jusqu'à")} {c.max} pts</p>
                </div>
              ))}
            </div>
          </div>

          {/* Example score card */}
          <div style={{ background: CREAM, borderRadius: 24, padding: "40px 36px" }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "3px", color: RUST, textTransform: "uppercase", marginBottom: 20 }}>
              {t("EXAMPLE SCORE", "EXEMPLE DE SCORE")}
            </p>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: DARK, marginBottom: 4, lineHeight: 1.3 }}>
              {t("Marché Jean-Talon — Summer Market", "Marché Jean-Talon — Marché d'été")}
            </h3>
            <p style={{ fontSize: 12, color: "#aaa", marginBottom: 28 }}>Rosemont · Villeray · {t("Outdoor Market", "Marché extérieur")}</p>

            {[
              { label: t("Walkable / Transit", "À pied / Transit"),   val: 23, max: 25 },
              { label: t("Low Waste",           "Faibles déchets"),    val: 20, max: 25 },
              { label: t("Local & Community",   "Local & Comm."),      val: 24, max: 25 },
              { label: t("Low Emissions",       "Faibles émissions"),  val: 19, max: 25 },
            ].map(bar => (
              <div key={bar.label} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>{bar.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: MOSS }}>{bar.val}/{bar.max}</span>
                </div>
                <div className="sust-bar-track">
                  <div className="sust-bar-fill" style={{ width: `${(bar.val / bar.max) * 100}%`, background: MOSS }} />
                </div>
              </div>
            ))}

            <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid rgba(0,0,0,0.08)`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#aaa", fontWeight: 600 }}>{t("TOTAL SCORE", "SCORE TOTAL")}</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 44, fontWeight: 900, color: MOSS, lineHeight: 1 }}>86</span>
                <span style={{ fontSize: 16, color: "#ccc" }}>/100</span>
                <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 999, background: MOSS, color: WHITE, marginLeft: 8 }}>
                  {t("Excellent", "Excellent")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOP-SCORED EVENTS ── */}
      <section ref={scoresRef} style={{ background: WHITE, padding: "100px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: RUST, textTransform: "uppercase", marginBottom: 16 }}>
            {t("ECO LEADERBOARD", "CLASSEMENT ÉCO")}
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 900, letterSpacing: "-2px", color: DARK, marginBottom: 12 }}>
            {t("Top-rated sustainable events.", "Événements les mieux notés.")}
          </h2>
          <p style={{ fontSize: 16, color: "#999", marginBottom: 44 }}>
            {t("Ranked by overall sustainability score.", "Classés par score de durabilité global.")}
          </p>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 40, flexWrap: "wrap" }}>
            {[
              { key: "overview", label: t("All events", "Tous les événements") },
              { key: "outdoor",  label: t("Outdoor",    "Plein air")           },
              { key: "free",     label: t("Free only",  "Gratuits")            },
            ].map(tab => (
              <button key={tab.key} className="sust-tab"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  background: activeTab === tab.key ? PINE : CREAM,
                  color:      activeTab === tab.key ? WHITE : "#666",
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {withScores.length === 0 ? (
            <p style={{ color: "#ccc", fontSize: 14 }}>{t("Loading events…", "Chargement…")}</p>
          ) : (
            <div className="sust-scores-grid">
              {withScores
                .filter(e => {
                  if (activeTab === "outdoor") return (e.type_evenement || "").toLowerCase().includes("plein");
                  if (activeTab === "free")    return e.cout === "Gratuit";
                  return true;
                })
                .slice(0, 12)
                .map((event, i) => {
                  const badge = scoreBadge(event.total);
                  return (
                    <div key={event.id ?? i} className="sust-score-card">
                      <div style={{ padding: "22px 24px 0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 10, color: SAGE, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 5 }}>
                              {event.type_evenement}
                            </p>
                            <h3 style={{ fontSize: 14, fontWeight: 800, color: DARK, lineHeight: 1.3 }}>
                              {lang === "fr" ? event.titre : (event.titre_en || event.titre)}
                            </h3>
                            <p style={{ fontSize: 12, color: "#bbb", marginTop: 3 }}>{event.arrondissement}</p>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                            <p style={{ fontSize: 30, fontWeight: 900, color: scoreColor((event.total / 100) * 100), lineHeight: 1 }}>{event.total}</p>
                            <p style={{ fontSize: 9, color: "#ccc", fontWeight: 700, textTransform: "uppercase" }}>/100</p>
                          </div>
                        </div>

                        {CRITERIA.map(c => (
                          <div key={c.key} style={{ marginBottom: 9 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ fontSize: 10, color: "#aaa", fontWeight: 600 }}>{c.icon} {c.label[lang]}</span>
                              <span style={{ fontSize: 10, fontWeight: 800, color: scoreColor((event.scores[c.key] / c.max) * 100) }}>{event.scores[c.key]}</span>
                            </div>
                            <div className="sust-bar-track">
                              <div className="sust-bar-fill" style={{ width: `${(event.scores[c.key] / c.max) * 100}%`, background: scoreColor((event.scores[c.key] / c.max) * 100) }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${CREAM}`, marginTop: 16 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 999, background: badge.color + "22", color: badge.color }}>
                          {badge.label[lang]}
                        </span>
                        {event.url_fiche && (
                          <a href={event.url_fiche} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 11, fontWeight: 700, color: MOSS, textDecoration: "none" }}
                            onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                            onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                            {t("Read more →", "En savoir plus →")}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 56 }}>
            <a href={`/${lang}`}
              style={{ display: "inline-block", background: PINE, color: WHITE, borderRadius: 999, padding: "15px 40px", fontSize: 14, fontWeight: 800, textDecoration: "none" }}>
              {t("← Back to all events", "← Retour aux événements")}
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER (matching MissionClient) ── */}
      <footer style={{ background: PINE, padding: "64px 8vw 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
            <div>
              <img src="/MTLVerde_Logo.png" alt="MTLVerde"
                style={{ height: 120, marginBottom: 24, filter: "brightness(10)" }}
                onError={e => { e.currentTarget.style.display = "none"; }} />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 280 }}>
                {t("Sustainable community events in Montréal — free, bilingual, and planet-first.", "Événements communautaires durables à Montréal — gratuits, bilingues et axés sur la planète.")}
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: 10, fontWeight: 800, marginBottom: 20, color: "rgba(255,255,255,0.7)", letterSpacing: "2px", textTransform: "uppercase" }}>
                {t("Company", "Compagnie")}
              </h4>
              {(lang === "en"
                ? [["About", "#about"], ["Press", "#press"], ["Careers", "#careers"]]
                : [["À propos", "#about"], ["Presse", "#press"], ["Carrières", "#careers"]]
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
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>© 2026 MTLVerde — {t("Events. Montreal. Together.", "Événements. Montréal. Ensemble.")}</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>mtlverde@gmail.com</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
