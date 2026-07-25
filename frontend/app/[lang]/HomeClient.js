"use client";
import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import Header from "./Header";
import { tField, eventDescription } from "./eventData";
import { useBookmarks } from "@/lib/bookmarks";
import { useEventsFeed } from "@/lib/useEventsFeed";
import MultiSelect from "./MultiSelect";
const Map = dynamic(() => import("./Map"), { ssr: false });
const ALL = "Tous";
const GREEN_DARK  = "#1e4d2b";
const GREEN_MID   = "#6a9e5a";
const GREEN_LIGHT = "#e8f0e4";
const RED         = "#b5281c";
const RED_LIGHT   = "#fdf0ee";
const CREAM       = "#f9f6f1";
const DARK        = "#111";
const EVENT_PHOTOS = {
  "Musique":                        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&q=80",
  "Initiation à la musique":        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=120&q=80",
  "Art et artisanat":               "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=120&q=80",
  "Art de la parole":               "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=120&q=80",
  "Cinéma":                         "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=120&q=80",
  "Cirque":                         "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=120&q=80",
  "Danse":                          "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=120&q=80",
  "Théâtre":                        "https://images.unsplash.com/photo-1503095396549-807759245b35?w=120&q=80",
  "Humour":                         "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=120&q=80",
  "Exposition":                     "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=120&q=80",
  "Sport et plein air":             "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=120&q=80",
  "Jardinage":                      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=120&q=80",
  "Cuisine":                        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=120&q=80",
  "Bien-être":                      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=120&q=80",
  "Jeux":                           "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=120&q=80",
  "Heure du conte":                 "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=120&q=80",
  "Club de lecture et littérature": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=120&q=80",
  "Langues":                        "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&q=80",
  "Informatique":                   "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=120&q=80",
  "Science et techno":              "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=120&q=80",
  "Société et histoire":            "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=120&q=80",
  "Soutien et échange":             "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=120&q=80",
  "Fête et marché":                 "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&q=80",
  "default":                        "https://images.unsplash.com/photo-1519098635131-4c8f806d1e82?w=120&q=80",
};
const getEventPhoto = (type) => EVENT_PHOTOS[type] || EVENT_PHOTOS["default"];
const BADGE_LEAVES = { "Green Leader": 3, "Eco-Friendly": 2, "Getting There": 1 };
const BADGE_COLORS = {
  "Green Leader":  { bg: "#d4ead4", color: "#1e4d2b" },
  "Eco-Friendly":  { bg: "#e4f0dc", color: "#2e6e30" },
  "Getting There": { bg: "#f0ead8", color: "#7a5a1a" },
};
function LeafIcons({ badge, size = 12 }) {
  const count = BADGE_LEAVES[badge] || 0;
  if (!count) return null;
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < count ? GREEN_MID : "#d8e8d4"} stroke="none" aria-hidden="true">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
        </svg>
      ))}
    </div>
  );
}
const TEAM = [
  { name: "Yan-Ling Lu",  role: { en: "Data Pipeline",          fr: "Pipeline de données"    }, photo: "/Yan-Ling_Lu.jpeg" },
  { name: "Sarah Liu",    role: { en: "Backend Development",    fr: "Développement backend"  }, photo: "/Sarah_Liu.jpeg" },
  { name: "Joohee Kim",   role: { en: "Sustainability Scoring", fr: "Score de durabilité"    }, photo: "/Joohee_Kim.JPG" },
  { name: "Chloee Liew",  role: { en: "Frontend Development",   fr: "Développement frontend" }, photo: "/Chloee_Liew.jpg" },
];
const PURPOSE = [
  { img: "https://images.unsplash.com/photo-1445296608114-4b8fabe48256?w=800&q=85", title: { en: "Discover by Borough", fr: "Découvrir par quartier" }, desc: { en: "Find events across all 20 Montreal boroughs, right in your neighbourhood.", fr: "Trouvez des événements dans vos 20 arrondissements de Montréal." } },
  { img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=85", title: { en: "Free & Accessible",   fr: "Gratuit et accessible"  }, desc: { en: "Most events are free, outdoors, and open to everyone.", fr: "La majorité de nos événements sont gratuits et ouverts à tous." } },
  { img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=85",    title: { en: "Local Events",         fr: "Événements locaux"      }, desc: { en: "Workshops, festivals, and markets that make the city pulse with life.", fr: "Des ateliers, festivals et marchés qui font battre le cœur de la ville." } },
  { img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=85", title: { en: "Built for You",       fr: "Personnalisé pour vous" }, desc: { en: "Filter by type, date, audience, and cost to find your perfect fit.", fr: "Filtrez par type, date, public et coût pour trouver votre événement idéal." } },
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
export default function HomeClient({ dict, lang, initialEvents = [] }) {
  const { events } = useEventsFeed({ initialData: initialEvents });
  const [typeFilter, setTypeFilter] = useState([]);
  const [arrFilter, setArrFilter]   = useState([]);
  const [audFilter, setAudFilter]   = useState([]);
  const [coutFilter, setCoutFilter] = useState(ALL);
  const [empFilter, setEmpFilter]   = useState(ALL);
  const [inscFilter, setInscFilter] = useState(ALL);
  const [startDate, setStartDate]   = useState("");
  const [endDate, setEndDate]       = useState("");
  const [showEvents, setShowEvents] = useState(false);
  const [email, setEmail]           = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const { isSaved, toggle } = useBookmarks();
  const eventsRef     = useRef(null);
  const purposeRef    = useRef(null);
  const teamRef       = useRef(null);
  const newsletterRef = useRef(null);
  const scrollTo = (ref) => { ref.current?.scrollIntoView({ behavior: "smooth" }); };
  const optionsFor = (field) =>
    [ALL, ...[...new Set(events.map((e) => e[field]).filter(Boolean))].sort()];
  const selectFilters = [
    { label: (dict || DICT[lang]).filters?.type           || "Type",           field: "type_evenement", value: typeFilter,  set: setTypeFilter, multi: true },
    { label: (dict || DICT[lang]).filters?.arrondissement || "Arrondissement", field: "arrondissement",  value: arrFilter,   set: setArrFilter,  multi: true },
    { label: (dict || DICT[lang]).filters?.cout           || "Cost",           field: "cout",            value: coutFilter,  set: setCoutFilter  },
    { label: (dict || DICT[lang]).filters?.lieu           || "Location",       field: "emplacement",     value: empFilter,   set: setEmpFilter   },
    { label: (dict || DICT[lang]).filters?.public         || "Audience",       field: "public_cible",    value: audFilter,   set: setAudFilter,  multi: true },
    { label: (dict || DICT[lang]).filters?.inscription    || "Registration",   field: "inscription",     value: inscFilter,  set: setInscFilter  },
  ];
  const filtered = events.filter((e) => {
    const selectMatch = selectFilters.every((f) =>
      f.multi
        ? (f.value.length === 0 || f.value.includes(e[f.field]))
        : (f.value === ALL || e[f.field] === f.value)
    );
    const startMatch  = !startDate || (e.date_debut && e.date_debut >= startDate);
    const endMatch    = !endDate   || (e.date_fin   && e.date_fin   <= endDate);
    return selectMatch && startMatch && endMatch;
  });
  const t = (en, fr) => lang === "fr" ? fr : en;
  const headerDict = dict || DICT[lang];
  return (
    <div style={{ fontFamily: "'DM Sans','Inter',sans-serif", background: "#fff", color: DARK, margin: 0, padding: 0 }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        .section-pad { padding: 100px 48px; }
        .team-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; }
        .events-preview { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 28px; margin-bottom: 48px; }
        .filters-wrap { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end; }
        .footer-grid { display: grid; grid-template-columns: 2.5fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 56px; }
        .event-list-card { display: flex; border: 1px solid ${GREEN_LIGHT}; border-radius: 16px; overflow: hidden; transition: all 0.2s; background: #fff; }
        .event-list-card:hover { border-color: ${GREEN_MID}; box-shadow: 0 4px 20px rgba(30,77,43,0.10); }
        .event-list-card.selected { border: 2px solid ${GREEN_DARK}; background: #eef7eb; box-shadow: 0 10px 30px rgba(30,77,43,0.18);}
        .event-list-card .thumb { width: 100px; min-width: 100px; overflow: hidden; flex-shrink: 0; }
        .event-list-card .thumb img { width: 100%; height: 100%; object-fit: cover; min-height: 100px; }
        .event-list-card .body { padding: 16px 20px; flex: 1; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; white-space: nowrap; }
        .badge-green  { background: ${GREEN_LIGHT}; color: ${GREEN_DARK}; }
        .badge-red    { background: ${RED_LIGHT};   color: ${RED};        }
        .badge-purple { background: #f3e8ff; color: #6b21a8; }
        .badge-pink   { background: #fce7f3; color: #9d174d; }
        .fest-preview-card { position: relative; overflow: hidden; height: 480px; width: 380px; flex-shrink: 0; cursor: pointer; transition: opacity 0.22s; text-decoration: none; display: block; }
        .fest-preview-card:hover { opacity: 0.92; }
        .fest-preview-card:hover img { transform: scale(1.04); }
        .fest-preview-card img { transition: transform 0.6s ease; width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
        .feat-scroll::-webkit-scrollbar { display: none; }
        .feat-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 768px) {
          .section-pad { padding: 64px 24px; }
          .team-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
          .events-preview { grid-template-columns: 1fr; }
          .filters-wrap > div { width: 100%; }
          .filters-wrap select, .filters-wrap input { width: 100%; }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .event-list-card { flex-direction: column; }
          .event-list-card .thumb { width: 100%; min-width: unset; height: 140px; }
          .newsletter-row { flex-direction: column; }
          .newsletter-row input, .newsletter-row button { width: 100%; }
          .mission-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .sustain-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .feat-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .team-grid { grid-template-columns: repeat(2, 1fr); }
          .footer-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <Header dict={headerDict} lang={lang} />

      {/* ── 1. HERO ── */}
      <section style={{ position: "relative", height: "100vh", minHeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src="https://images.unsplash.com/photo-1445296608114-4b8fabe48256?w=1800&q=90" alt="Montreal"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(30,77,43,0.85) 0%, rgba(0,0,0,0.45) 50%, rgba(181,40,28,0.38) 100%)" }} />
        <div style={{ position: "relative", zIndex: 2, width: "100%", padding: "0 6vw", textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "3px", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 24 }}>
            {t("GREENER, TOGETHER IN MONTREAL", "PLUS VERT, ENSEMBLE À MONTRÉAL")}
          </p>
          <h1 style={{ fontSize: "clamp(56px, 10vw, 140px)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-4px", color: "#fff", marginBottom: 32 }}>
            {t("Explore Montreal", "Explorez Montréal")}
          </h1>
          <p style={{ fontSize: "clamp(15px, 1.8vw, 20px)", color: "rgba(255,255,255,0.75)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 44px" }}>
            {t(
              "Community events, workshops and local markets in Montreal. All seasons long. All in one place.",
              "Événements communautaires, ateliers et marchés locaux à Montréal. Toutes les saisons. Tout au même endroit."
            )}
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => { setShowEvents(true); setTimeout(() => scrollTo(eventsRef), 80); }}
              style={{ background: "#fff", color: GREEN_DARK, border: "none", borderRadius: 999, padding: "16px 40px", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 24px rgba(0,0,0,0.25)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
              {t("Find events", "Trouver des événements")}
            </button>
            <button onClick={() => scrollTo(purposeRef)}
              style={{ background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,0.5)", borderRadius: 999, padding: "16px 40px", fontSize: 16, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}>
              {t("Learn more", "En savoir plus")}
            </button>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.5 }}>
          <div style={{ width: 1, height: 40, background: "#fff" }} />
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", color: "#fff", textTransform: "uppercase" }}>scroll</span>
        </div>
      </section>

      {/* ── 2. OUR PURPOSE ── */}
      <section id="purpose" ref={purposeRef} className="section-pad" style={{ background: CREAM }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 56, flexWrap: "wrap", gap: 24 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "3px", color: RED, textTransform: "uppercase", marginBottom: 14 }}>
                {t("WHY WE BUILT THIS", "POURQUOI NOUS L'AVONS CRÉÉ")}
              </p>
              <h2 style={{ fontSize: "clamp(30px, 4vw, 54px)", fontWeight: 900, letterSpacing: "-1.5px", color: DARK, maxWidth: 400, lineHeight: 1.1 }}>
                {t("Our Purpose", "Notre mission")}
              </h2>
            </div>
            <p style={{ fontSize: 15, color: "#666", lineHeight: 1.75, maxWidth: 360 }}>
              {t("Montréal produces thousands of free events every year. We make them easy to find.", "Montréal organise des milliers d'événements gratuits chaque année. Nous les rendons faciles à trouver.")}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {PURPOSE.map((p, i) => (
              <div key={i}>
                <div style={{ height: 480, overflow: "hidden", marginBottom: 20 }}>
                  <img src={p.img} alt={p.title.en}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.6s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }} />
                </div>
                <h3 style={{ fontSize: 28, fontWeight: 900, color: DARK, marginBottom: 10, letterSpacing: "-0.5px", lineHeight: 1.1 }}>{p.title[lang]}</h3>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>{p.desc[lang]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. OUR MISSION TEASER ── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "80px 48px" }}>
        {/* Aerial rainforest photo — full bleed */}
        <img
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1800&q=90"
          alt="Forest from above"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
        {/* Dark green overlay so text is legible */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,30,12,0.72)" }} />

        <div className="mission-grid" style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "3px", color: GREEN_MID, textTransform: "uppercase", marginBottom: 16 }}>
              {t("OUR MISSION", "NOTRE MISSION")}
            </p>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 900, letterSpacing: "-1.5px", color: "#fff", marginBottom: 20, lineHeight: 1.1 }}>
              {t("Built for newcomers, neighbours, and everyone in between.", "Conçu pour les nouveaux arrivants, les voisins, et tout le monde.")}
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: 36 }}>
              {t(
                "Montréal produces thousands of free community events every year — but they're scattered, hard to find, and often only in French. MTLVerde brings them together in one free, bilingual place.",
                "Montréal organise des milliers d'événements communautaires gratuits chaque année — mais ils sont dispersés, difficiles à trouver et souvent uniquement en français. MTLVerde les rassemble en un seul endroit gratuit et bilingue."
              )}
            </p>
            <a href={`/${lang}/mission`} style={{ display: "inline-block", background: "#fff", color: GREEN_DARK, borderRadius: 999, padding: "13px 32px", fontSize: 14, fontWeight: 800, textDecoration: "none" }}>
              {t("Read our mission →", "Lire notre mission →")}
            </a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { num: "3,000+", label: t("Events this year", "Événements cette année") },
              { num: "20",     label: t("Boroughs",          "Arrondissements")        },
              { num: "50k",    label: t("Newcomers/year",    "Nouveaux arrivants/an")  },
              { num: "Free",   label: t("Always",            "Toujours")               },
            ].map((s) => (
              <div key={s.num} style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(6px)", borderRadius: 16, padding: "28px 20px", textAlign: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
                <p style={{ fontSize: "clamp(24px, 2.5vw, 36px)", fontWeight: 900, color: "#fff", marginBottom: 8 }}>{s.num}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. FEATURED FESTIVALS TEASER ── */}
      <section style={{ background: CREAM, padding: "80px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 48, flexWrap: "wrap", gap: 20 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "3px", color: RED, textTransform: "uppercase", marginBottom: 14 }}>
                {t("MTLVERDE · CURATED", "MTLVERDE · SÉLECTION")}
              </p>
              <h2 style={{ fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 900, letterSpacing: "-1.5px", color: DARK, lineHeight: 1.1 }}>
                {t("Featured Festivals", "Festivals à l'affiche")}
              </h2>
            </div>
            <a href={`/${lang}/festivals`}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `2px solid ${GREEN_DARK}`, color: GREEN_DARK, borderRadius: 999, padding: "11px 26px", fontSize: 13, fontWeight: 800, textDecoration: "none", transition: "all 0.2s", whiteSpace: "nowrap" }}
              onMouseEnter={e => { e.currentTarget.style.background = GREEN_DARK; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = GREEN_DARK; }}>
              {t("See all festivals →", "Voir tous les festivals →")}
            </a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { photo: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=700&q=85", label: t("Music & Arts",  "Musique et arts"),    sub: t("Outdoor · Free",  "Plein air · Gratuit"),       tag: t("Festival", "Festival") },
              { photo: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=700&q=85", label: t("Jazz Festival", "Festival de Jazz"),    sub: t("Downtown · Free", "Centre-ville · Gratuit"),    tag: t("Annual",   "Annuel")   },
              { photo: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700&q=85", label: t("Cinema",        "Cinéma"),              sub: t("Rialto · Curated","Rialto · Sélection"),        tag: t("Curated",  "Sélection") },
            ].map((card, i) => (
              <a key={i} href={`/${lang}/festivals`} style={{ textDecoration: "none", borderRadius: 20, overflow: "hidden", border: `1px solid ${GREEN_LIGHT}`, background: "#fff", display: "block", transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(30,77,43,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ height: 200, overflow: "hidden", position: "relative" }}>
                  <img src={card.photo} alt={card.label} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }} />
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.15)" }} />
                  <span style={{ position: "absolute", top: 14, left: 14, fontSize: 9, fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,0.2)", color: "#fff", backdropFilter: "blur(4px)" }}>
                    {card.tag}
                  </span>
                </div>
                <div style={{ padding: "18px 20px 22px" }}>
                  <p style={{ fontSize: 11, color: GREEN_MID, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
                    {t("Festival", "Festival")}
                  </p>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: DARK, marginBottom: 6, lineHeight: 1.2 }}>{card.label}</h3>
                  <p style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Montréal</p>
                  <p style={{ fontSize: 11, color: "#bbb", marginBottom: 14 }}>{card.sub}</p>
                  <span style={{ fontSize: 12, fontWeight: 800, color: GREEN_DARK }}>
                    {t("View Festival →", "Voir le festival →")}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. EVENTS ── */}
      <section id="events" ref={eventsRef} className="section-pad" style={{ background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "3px", color: RED, textTransform: "uppercase", marginBottom: 14 }}>
            {t("WHAT'S ON", "À L'AFFICHE")}
          </p>
          <h2 style={{ fontSize: "clamp(30px, 4vw, 54px)", fontWeight: 900, letterSpacing: "-1.5px", marginBottom: 52 }}>
            {t("Upcoming Events", "Événements à venir")}
          </h2>
          {events.length > 0 && (
            <div style={{ position: "relative", margin: "0 -48px", marginBottom: 48 }}>
              <div className="feat-scroll" style={{ display: "flex", gap: 4, overflowX: "auto", paddingLeft: 48, paddingBottom: 8 }}>
                {events.slice(0, 7).map((event, i) => (
                  <div key={i} className="fest-preview-card" style={{ flexShrink: 0 }}>
                    <img src={getEventPhoto(event.type_evenement)} alt={event.type_evenement} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,12,5,0.92) 0%, rgba(5,12,5,0.25) 55%, rgba(5,12,5,0.0) 100%)" }} />
                    {/* cost pill top-left */}
                    <div style={{ position: "absolute", top: 16, left: 16 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: event.cout === "Gratuit" ? "rgba(30,77,43,0.85)" : "rgba(181,40,28,0.85)", color: "#fff", backdropFilter: "blur(4px)" }}>
                        {tField("cout", event.cout, lang)}
                      </span>
                    </div>
                    {/* bottom info */}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 20px 22px", display: "flex", flexDirection: "column", gap: 8 }}>
                      {event.badge && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <LeafIcons badge={event.badge} size={12} />
                          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(255,255,255,0.15)", color: "#fff", backdropFilter: "blur(4px)" }}>{event.badge}</span>
                        </div>
                      )}
                      <div>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{tField("type_evenement", event.type_evenement, lang)}</p>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-0.3px", lineHeight: 1.2, marginBottom: 3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {lang === "fr" ? event.titre : (event.titre_en || event.titre)}
                        </h3>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{event.arrondissement}</p>
                      </div>
                      <div style={{ display: "inline-flex" }}>
                        <span style={{ fontSize: 11, fontWeight: 800, padding: "7px 16px", borderRadius: 999, background: "#fff", color: DARK }}>
                          {t("View Event", "Voir l'événement")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ width: 48, flexShrink: 0 }} />
              </div>
              <button type="button"
                onClick={() => { const el = document.querySelector(".events-hscroll"); if (el) el.scrollBy({ left: 400, behavior: "smooth" }); }}
                style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-60%)", width: 44, height: 44, borderRadius: "50%", background: "#fff", border: "1px solid #e0e0e0", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}
                aria-label="Scroll right">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          )}
          {!showEvents ? (
            <div style={{ textAlign: "center" }}>
              <button onClick={() => setShowEvents(true)} style={{ background: GREEN_DARK, color: "#fff", border: "none", borderRadius: 999, padding: "15px 44px", fontSize: 15, fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = RED; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = GREEN_DARK; e.currentTarget.style.transform = "translateY(0)"; }}>
                {t("See all events", "Voir tous les événements")}
              </button>
            </div>
          ) : (
            <>
              <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", marginBottom: 32, border: `1px solid ${GREEN_LIGHT}` }}>
                <Map events={filtered} lang={lang} readMoreLabel={(dict || DICT[lang]).event?.readMore || "Read more"} selectedId={selectedId} />
              </div>
              <div className="filters-wrap" style={{ background: CREAM, borderRadius: 16, padding: "24px 28px", marginBottom: 28 }}>
                {selectFilters.map((f) =>
                  f.multi ? (
                    <MultiSelect
                      key={f.field}
                      label={f.label}
                      field={f.field}
                      options={optionsFor(f.field).filter((o) => o !== ALL)}
                      selected={f.value}
                      onChange={f.set}
                      dict={dict || DICT[lang]}
                      lang={lang}
                    />
                  ) : (
                    <div key={f.field}>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 7 }}>{f.label}</label>
                      <select style={{ border: `1.5px solid ${GREEN_LIGHT}`, borderRadius: 10, padding: "9px 14px", fontSize: 13, background: "#fff", cursor: "pointer", color: DARK }}
                        value={f.value} onChange={(e) => f.set(e.target.value)}>
                        {optionsFor(f.field).map((o) => (
                          <option key={o} value={o}>{o === ALL ? ((dict || DICT[lang]).filters?.all || "All") : tField(f.field, o, lang)}</option>
                        ))}
                      </select>
                    </div>
                  )
                )}
                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 7 }}>{(dict || DICT[lang]).filters?.startDate || "Start date"}</label>
                  <input type="date" style={{ border: `1.5px solid ${GREEN_LIGHT}`, borderRadius: 10, padding: "9px 14px", fontSize: 13, color: DARK }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 7 }}>{(dict || DICT[lang]).filters?.endDate || "End date"}</label>
                  <input type="date" style={{ border: `1.5px solid ${GREEN_LIGHT}`, borderRadius: 10, padding: "9px 14px", fontSize: 13, color: DARK }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <p style={{ fontSize: 13, color: "#aaa" }}>{(dict || DICT[lang]).results?.count?.replace("{count}", filtered.length) || `${filtered.length} events`}</p>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {filtered.map((event) => (
                  <div key={event.id} className={`event-list-card ${ selectedId === event.id ? "selected" : ""}`} onClick={() => setSelectedId(prev => (prev === event.id ? null : event.id))}>
                    <div className="thumb">
                      <img src={getEventPhoto(event.type_evenement)} alt={event.type_evenement} />
                    </div>
                    <div className="body">
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                          <p style={{ fontSize: 10, color: GREEN_MID, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{tField("type_evenement", event.type_evenement, lang)}</p>
                          {event.badge && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <LeafIcons badge={event.badge} size={12} />
                              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: (BADGE_COLORS[event.badge] || {}).bg || GREEN_LIGHT, color: (BADGE_COLORS[event.badge] || {}).color || GREEN_DARK }}>
                                {event.badge}
                              </span>
                            </div>
                          )}
                        </div>
                        <h2 style={{ fontSize: 15, fontWeight: 800, color: DARK, marginBottom: 4, lineHeight: 1.3 }}>{lang === "fr" ? event.titre : (event.titre_en || event.titre)}</h2>
                        <p style={{ fontSize: 12, color: "#888", marginBottom: 3 }}>{event.arrondissement}</p>
                        <p style={{ fontSize: 11, color: "#ccc", marginBottom: 8 }}>{event.date_debut} → {event.date_fin}</p>
                        <p style={{ fontSize: 12, color: "#666", lineHeight: 1.6, marginBottom: 10 }}>{eventDescription(event, lang)}</p>
                        {event.url_fiche && (
                          <a href={event.url_fiche} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 12, fontWeight: 700, color: GREEN_DARK, textDecoration: "none" }}
                            onMouseEnter={e => { e.currentTarget.style.textDecoration = "underline"; }}
                            onMouseLeave={e => { e.currentTarget.style.textDecoration = "none"; }}>
                            {(dict || DICT[lang]).event?.readMore || "Read more"} →
                          </a>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, alignItems: "flex-end", alignSelf: "stretch" }}>
                        {event.public_cible && <span className="badge badge-pink">{tField("public_cible", event.public_cible, lang)}</span>}
                        <span className={`badge ${event.cout === "Gratuit" ? "badge-green" : "badge-red"}`}>
                          {tField("cout", event.cout, lang)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggle(event.id); }}
                          aria-label={isSaved(event.id) ? ((dict || DICT[lang]).event?.unsave || "Remove from saved") : ((dict || DICT[lang]).event?.save || "Save event")}
                          aria-pressed={isSaved(event.id)}
                          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: RED, display: "flex", marginTop: "auto" }}
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
            </>
          )}
        </div>
      </section>

      {/* ── 6. SUSTAINABILITY TEASER — full-bleed photo ── */}
      <section style={{ position: "relative", height: "70vh", minHeight: 480, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Full-bleed landscape photo */}
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1800&q=90"
          alt="Mountain landscape"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }}
        />
        {/* Dark overlay — heavier in centre to frame the text */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.52) 50%, rgba(0,0,0,0.30) 100%)" }} />

        {/* Content — centred */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 24px", maxWidth: 760 }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", marginBottom: 28 }}>
            {t("MTLVerde · Sustainability", "MTLVerde · Durabilité")}
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4.5vw, 64px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 28 }}>
            {t(
              "The most sustainable event is one you can walk to.",
              "L'événement le plus durable est celui dont on peut marcher jusqu'à."
            )}
          </h2>
          <p style={{ fontSize: "clamp(13px, 1.4vw, 17px)", color: "rgba(255,255,255,0.65)", lineHeight: 1.75, marginBottom: 40, maxWidth: 560, margin: "0 auto 40px" }}>
            {t(
              "Every event on MTLVerde gets an eco-score based on transit access, carbon footprint, and more.",
              "Chaque événement sur MTLVerde reçoit un score écologique basé sur l'accès aux transports et l'empreinte carbone."
            )}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={`/${lang}/sustainability`}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: DARK, borderRadius: 999, padding: "14px 36px", fontSize: 14, fontWeight: 800, textDecoration: "none", transition: "opacity 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
              {t("Learn more →", "En savoir plus →")}
            </a>
          </div>
        </div>

        {/* Frosted tag pills — bottom left */}
        <div style={{ position: "absolute", bottom: 28, left: 48, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[t("Low emissions","Faibles émissions"), t("Walkable","Accessible à pied"), t("Zero waste","Zéro déchet"), t("Local","Local")].map(tag => (
            <span key={tag} style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "6px 14px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.25)" }}>{tag}</span>
          ))}
        </div>
      </section>

      {/* ── 7. ABOUT THE TEAM ── */}
      <section id="team" ref={teamRef} className="section-pad" style={{ background: CREAM }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "3px", color: RED, textTransform: "uppercase", marginBottom: 14 }}>
            {t("THE PEOPLE BEHIND IT", "L'ÉQUIPE DERRIÈRE LE PROJET")}
          </p>
          <h2 style={{ fontSize: "clamp(30px, 4vw, 54px)", fontWeight: 900, letterSpacing: "-1.5px", color: DARK, marginBottom: 56 }}>
            {t("About the Team", "L'équipe")}
          </h2>
          <div className="team-grid">
            {TEAM.map((m, i) => (
              <div key={m.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ width: 130, height: 130, borderRadius: "50%", overflow: "hidden", marginBottom: 18, border: `3px solid ${i % 2 === 0 ? GREEN_MID : RED}`, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
                  {m.photo
                    ? <img src={m.photo} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                    : <div style={{ width: "100%", height: "100%", background: i % 2 === 0 ? GREEN_LIGHT : RED_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 900, color: i % 2 === 0 ? GREEN_DARK : RED }}>{m.name[0]}</div>
                  }
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: DARK, marginBottom: 6 }}>{m.name}</h3>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 999, background: i % 2 === 0 ? "rgba(106,158,90,0.25)" : "rgba(181,40,28,0.25)", color: i % 2 === 0 ? GREEN_MID : "#e07070" }}>
                  {m.role[lang]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. NEWSLETTER ── */}
      <section id="newsletter" ref={newsletterRef} className="section-pad" style={{ background: "#fff" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "3px", color: GREEN_DARK, textTransform: "uppercase", marginBottom: 20 }}>
            {t("STAY CONNECTED", "RESTEZ CONNECTÉ")}
          </p>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 900, letterSpacing: "-1px", marginBottom: 16, color: DARK }}>
            {t("Stay in the loop", "Restez informé")}
          </h2>
          <p style={{ fontSize: 15, color: "#777", marginBottom: 36, lineHeight: 1.75 }}>
            {t("Subscribe to get the latest news and interesting community events about Montreal.", "Abonnez-vous pour recevoir les dernières nouvelles et événements communautaires à Montréal.")}
          </p>
          {subscribed ? (
            <p style={{ fontSize: 18, fontWeight: 800, color: GREEN_DARK }}>{t("Thanks for subscribing!", "Merci de vous être abonné!")}</p>
          ) : (
            <div className="newsletter-row" style={{ display: "flex", gap: 10, maxWidth: 460, margin: "0 auto" }}>
              <input type="email" placeholder={t("Your email address", "Votre adresse courriel")} value={email} onChange={(e) => setEmail(e.target.value)}
                style={{ flex: 1, border: "1.5px solid #d8d8d8", borderRadius: 12, padding: "14px 18px", fontSize: 14, outline: "none", color: DARK, background: "#fff" }} />
              <button onClick={() => { if (email) setSubscribed(true); }}
                style={{ background: RED, color: "#fff", border: "none", borderRadius: 12, padding: "14px 26px", fontSize: 14, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#9a1f15"; }}
                onMouseLeave={e => { e.currentTarget.style.background = RED; }}>
                {t("Subscribe", "S'abonner")}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="section-pad" style={{ background: GREEN_DARK, color: "#fff", paddingBottom: 32 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="footer-grid">
            <div>
              <img src="/MTLVerde_Logo.png" alt="MTLVerde" style={{ height: 72, marginBottom: 20, filter: "brightness(10)" }}
                onError={(e) => { e.currentTarget.style.display = "none"; }} />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, maxWidth: 280 }}>
                {t("Discover community life in Montreal — free, bilingual, and built for newcomers.", "Découvrir la vie communautaire à Montréal — gratuit, bilingue, et conçu pour les nouveaux arrivants.")}
              </p>
            </div>
            {[
              { heading: t("Company", "Compagnie"), links: [t("About", "À propos"), "Press", "Careers"] },
              { heading: t("Contact", "Contact"),   links: ["Help/FAQ", t("Team", "Équipe"), "mtlverde@gmail.com"] },
              { heading: t("More", "Plus"),         links: [t("Open Data", "Données ouvertes"), t("Accessibility", "Accessibilité"), t("Privacy", "Confidentialité")] },
            ].map((col) => (
              <div key={col.heading}>
                <h4 style={{ fontSize: 11, fontWeight: 800, marginBottom: 20, color: "rgba(255,255,255,0.9)", letterSpacing: "1px", textTransform: "uppercase" }}>{col.heading}</h4>
                {col.links.map((l) => (
                  <p key={l} style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 12, cursor: "pointer", transition: "color 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>{l}</p>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 28, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© 2026 MTLVerde — Events. Montreal. Together.</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>mtlverde@gmail.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
