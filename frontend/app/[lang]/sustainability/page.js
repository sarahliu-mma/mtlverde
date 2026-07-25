// frontend/app/[lang]/sustainability/page.js
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import Header from "../Header";
import SustainabilityRanking from "./SustainabilityRanking";

const PINE  = "#1a2e1a";
const MOSS  = "#3d5a3e";
const SAGE  = "#7a9e7e";
const STONE = "#c8b89a";
const CREAM = "#f5f0e8";
const RUST  = "#a0522d";
const DARK  = "#0f1a0f";
const WHITE = "#ffffff";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.sustainability.title,
    description: dict.sustainability.intro.slice(0, 155),
  };
}

export default async function Sustainability({ params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const s = dict.sustainability;
  const fr = lang === "fr";

  const signals = [
    { tag: "TRANSIT",                         title: s.transitTitle, body: s.transit, max: "45 pts" },
    { tag: fr ? "ACCÈS PIÉTON" : "WALK-IN",   title: s.walkinTitle,  body: s.walkin,  max: "35 pts" },
    { tag: fr ? "EXTÉRIEUR" : "OUTDOOR",       title: s.outdoorTitle, body: s.outdoor, max: "20 pts" },
  ];

  const tiers = [
    {
      label:  fr ? "CHEF DE FILE VERT" : "GREEN LEADER",
      range:  "90–100",
      body:   s.tier3,
      color:  MOSS,
      leaves: 3,
      photo:  "https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=85",
    },
    {
      label:  fr ? "ÉCO-RESPONSABLE" : "ECO-FRIENDLY",
      range:  "65–89",
      body:   s.tier2,
      color:  SAGE,
      leaves: 2,
      photo:  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=85",
    },
    {
      label:  fr ? "EN CHEMIN" : "GETTING THERE",
      range:  "0–64",
      body:   s.tier1,
      color:  STONE,
      leaves: 1,
      photo:  "https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=800&q=85",
    },
  ];

  const methodologyItems = fr ? [
    "Le trajet des participants est le principal facteur environnemental.",
    "Les données de transit sont précises, vérifiables et à l'échelle de la ville.",
    "Retesté sur des milliers d'événements — les classements restent stables.",
    "Reflète l'infrastructure réelle de Montréal, pas des choix arbitraires.",
  ] : [
    "Attendee travel is the single biggest environmental factor.",
    "Transit data is precise, verifiable, and city-wide.",
    "Re-tested across thousands of events — the rankings hold.",
    "Reflects Montréal's real infrastructure, not arbitrary choices.",
  ];

  const footerCompany = fr
    ? [["À propos", `/${lang}#about`], ["Presse", `/${lang}#press`], ["Carrières", `/${lang}#careers`]]
    : [["About",    `/${lang}#about`], ["Press",  `/${lang}#press`], ["Careers",  `/${lang}#careers`]];

  const footerContact = [
    ["Help / FAQ", `/${lang}#faq`],
    ["Team",       `/${lang}#team`],
    ["mtlverde@gmail.com", "mailto:mtlverde@gmail.com"],
  ];

  const CIRC = 276.5;
  const dashOffset = (CIRC * (1 - 25 / 68)).toFixed(1);

  // Split s.honest on the 🌿 emoji to replace with custom SVG
  const honestParts = s.honest ? s.honest.split(/🌿|🌱|🍃/) : [""];

  return (
    <div style={{ fontFamily: "'DM Sans','Inter',sans-serif", background: CREAM, color: DARK, margin: 0, padding: 0 }}>
      <style>{`
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
        details > summary::marker { display: none; }
        details[open] .sig-chevron { transform: rotate(45deg); }
        details .sig-chevron { display: inline-block; transition: transform 0.2s; }

        .tier-card { position: relative; overflow: hidden; cursor: default; }
        .tier-img { transition: transform 0.55s ease; width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
        .tier-card:hover .tier-img { transform: scale(1.06); }
        .tier-hover-overlay { position: absolute; inset: 0; background: rgba(26,46,26,0.65); opacity: 0; transition: opacity 0.35s; }
        .tier-card:hover .tier-hover-overlay { opacity: 1; }
        .tier-desc { opacity: 0; transform: translateY(14px); transition: opacity 0.3s 0.06s, transform 0.3s 0.06s; }
        .tier-card:hover .tier-desc { opacity: 1; transform: translateY(0); }
      `}</style>

      <Header dict={dict} lang={lang} />

      {/* ── HERO ── */}
      <section style={{ position: "relative", height: "100vh", minHeight: 600, display: "flex", alignItems: "flex-end" }}>
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1900&q=90"
          alt=""
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,20,10,0.95) 0%, rgba(10,20,10,0.5) 40%, rgba(10,20,10,0.08) 100%)" }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", padding: "0 48px 80px", width: "100%" }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: SAGE, textTransform: "uppercase", marginBottom: 20 }}>
            {fr ? "MTLVERDE · DURABILITÉ" : "MTLVERDE · SUSTAINABILITY"}
          </p>
          <h1 style={{ fontSize: "clamp(64px, 11vw, 140px)", fontWeight: 900, lineHeight: 0.88, letterSpacing: "-5px", color: WHITE, marginBottom: 24 }}>
            {fr ? "Durabilité" : "Sustainability"}
          </h1>
          <p style={{ fontSize: "clamp(16px, 1.8vw, 22px)", fontStyle: "italic", fontWeight: 300, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, maxWidth: 560, letterSpacing: "-0.2px" }}>
            {fr
              ? "\"La durabilité est notre objectif ultime — chaque événement, chaque trajet, chaque choix compte.\""
              : "\"Sustainability is our ultimate goal — every event, every journey, every choice adds up.\""}
          </p>
        </div>
        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.35 }}>
          <div style={{ width: 1, height: 44, background: WHITE }} />
          <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "3px", color: WHITE, textTransform: "uppercase" }}>scroll</span>
        </div>
      </section>

      {/* ── HOW WE SCORE — full-bleed snow/forest photo with content overlaid ── */}
      <section style={{ position: "relative", minHeight: "80vh", overflow: "hidden", display: "flex", alignItems: "center" }}>
        <img
          src="https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1800&q=85"
          alt=""
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 55%" }}
        />
        {/* Dark overlay so content stays readable */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(5,12,5,0.72)" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "100px 48px", width: "100%", display: "flex", flexWrap: "wrap", gap: 64, alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 340px" }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: SAGE, textTransform: "uppercase", marginBottom: 20 }}>
              {fr ? "COMMENT NOUS ÉVALUONS" : "HOW WE SCORE"}
            </p>
            <h2 style={{ fontSize: "clamp(36px, 5vw, 68px)", fontWeight: 900, letterSpacing: "-2.5px", lineHeight: 0.95, color: WHITE, margin: 0 }}>
              {fr ? "Chaque événement\na son score." : "Every event\nhas a score."}
            </h2>
          </div>
          <div style={{ flex: "1 1 340px", paddingTop: 8 }}>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 18px)", color: "rgba(255,255,255,0.6)", lineHeight: 1.85, marginBottom: 28 }}>
              {s.intro}
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                {
                  n: "45", label: fr ? "transport" : "transit",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={SAGE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="13" rx="2" />
                      <path d="M3 9h18" />
                      <circle cx="8" cy="14" r="1" fill={SAGE} stroke="none" />
                      <circle cx="16" cy="14" r="1" fill={SAGE} stroke="none" />
                      <path d="M7 17l-1 3M17 17l1 3" />
                    </svg>
                  ),
                },
                {
                  n: "35", label: fr ? "piéton" : "walk-in",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={SAGE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="4" r="1.5" />
                      <path d="M9 20l1.5-4.5 2.5 2 2-4.5" />
                      <path d="M11.5 7.5l1.5 4 3.5 1.5-2.5 1" />
                      <path d="M8 12l1.5-4.5" />
                    </svg>
                  ),
                },
                {
                  n: "20", label: fr ? "extérieur" : "outdoor",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={SAGE} stroke="none" aria-hidden="true">
                      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
                    </svg>
                  ),
                },
              ].map(function(stat) {
                return (
                  <div key={stat.n} style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: "20px 24px 18px", minWidth: 110, display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
                    <p style={{ display: "flex", alignItems: "baseline", gap: 4, margin: 0 }}>
                      <span style={{ fontSize: 30, fontWeight: 900, color: WHITE, letterSpacing: "-1px" }}>
                        {stat.n}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.5px" }}>
                        pts
                      </span>
                    </p>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>
                      {stat.label}
                    </p>
      
                    <div style={{ marginTop: 10 }}>{stat.icon}</div>
                    </div>
                  );
                })}
   
      {/* ── NATURE BRIDGE — family photo ── */}
      <section style={{ position: "relative", height: "68vh", minHeight: 400, overflow: "hidden" }}>
        <img
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=85"
          alt=""
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,20,10,0.96) 0%, rgba(10,20,10,0.55) 55%, rgba(10,20,10,0.1) 100%)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "0 48px", height: "100%", display: "flex", alignItems: "flex-end", paddingBottom: 72 }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", display: "block", marginBottom: 18 }}>
              {fr ? "02 · NOTRE APPROCHE" : "02 · OUR APPROACH"}
            </span>
            <h2 style={{ fontSize: "clamp(40px, 6vw, 84px)", fontWeight: 900, color: WHITE, lineHeight: 0.9, letterSpacing: "-3px", marginBottom: 24, maxWidth: 700 }}>
              {fr ? "Chaque trajet\ncompte." : "Every journey\ncounts."}
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, maxWidth: 480 }}>
              {fr
                ? "La façon dont les gens se rendent à un événement est l'empreinte écologique la plus importante — et c'est ce que nous mesurons."
                : "How people get to an event is the biggest environmental footprint — and that's what we measure."}
            </p>
          </div>
        </div>
      </section>

      {/* ── TIERS — photo cards with hover reveal ── */}
      <section style={{ background: WHITE, padding: "100px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: RUST, textTransform: "uppercase", marginBottom: 16 }}>
            {fr ? "LES NIVEAUX" : "THE TIERS"}
          </p>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 50px)", fontWeight: 900, letterSpacing: "-1.5px", color: DARK, marginBottom: 48, lineHeight: 1.1 }}>
            {s.tiersTitle}
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {tiers.map(function(tier) {
              return (
                <div key={tier.label} className="tier-card" style={{ flex: "1 1 280px", height: 440, borderRadius: 22 }}>
                  <img className="tier-img" src={tier.photo} alt="" aria-hidden="true" />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,12,5,0.92) 0%, rgba(5,12,5,0.35) 50%, rgba(5,12,5,0.05) 100%)" }} />
                  <div className="tier-hover-overlay" />
                  <div style={{ position: "absolute", inset: 0, padding: "28px 28px 32px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
                      {Array.from({ length: tier.leaves }).map(function(_, i) {
                        return (
                          <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill={tier.color} stroke="none" aria-hidden="true">
                            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
                          </svg>
                        );
                      })}
                      {Array.from({ length: 3 - tier.leaves }).map(function(_, i) {
                        return (
                          <svg key={"e" + i} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" aria-hidden="true">
                            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
                          </svg>
                        );
                      })}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "2.5px", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                      {tier.label}
                    </span>
                    <span style={{ fontSize: 38, fontWeight: 900, color: WHITE, display: "block", letterSpacing: "-2px", lineHeight: 1, marginBottom: 14 }}>
                      {tier.range}
                    </span>
                    <p className="tier-desc" style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", lineHeight: 1.75, margin: 0 }}>
                      {tier.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── OUR METHODOLOGY — overlaid on mountain photo ── */}
      <section style={{ position: "relative", minHeight: "80vh", overflow: "hidden", display: "flex", alignItems: "center" }}>
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1800&q=85"
          alt=""
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(5,12,5,0.72)" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "100px 48px", width: "100%" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 72, alignItems: "flex-start" }}>

            <div style={{ flex: "1 1 300px" }}>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: SAGE, textTransform: "uppercase", marginBottom: 16 }}>
                {fr ? "NOTRE MÉTHODOLOGIE" : "OUR METHODOLOGY"}
              </p>
              <h2 style={{ fontSize: "clamp(26px, 3vw, 44px)", fontWeight: 900, letterSpacing: "-1.5px", color: WHITE, lineHeight: 1.1, marginBottom: 36 }}>
                {s.signalsTitle}
              </h2>
              <div>
                {methodologyItems.map(function(point, i) {
                  return (
                    <div key={i} style={{ display: "flex", gap: 20, alignItems: "flex-start", padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <span style={{ fontSize: 10, fontWeight: 900, color: SAGE, letterSpacing: "1px", flexShrink: 0, fontFamily: "monospace", paddingTop: 2 }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span style={{ fontSize: 14, color: "rgba(255,255,255,0.52)", lineHeight: 1.8 }}>{point}</span>
                    </div>
                  );
                })}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
              </div>
            </div>

            <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 10 }}>
              {signals.map(function(sig) {
                return (
                  <details key={sig.title} style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(6px)", borderRadius: 16, overflow: "hidden" }}>
                    <summary style={{ padding: "20px 22px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer", userSelect: "none" }}>
                      <div style={{ flexShrink: 0 }}>
                        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "2px", color: SAGE, textTransform: "uppercase", display: "block", marginBottom: 4 }}>{sig.tag}</span>
                        <span style={{ fontSize: 14, fontWeight: 900, color: SAGE }}>{sig.max}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 800, color: WHITE, margin: 0 }}>{sig.title}</h3>
                      </div>
                      <span className="sig-chevron" style={{ color: "rgba(255,255,255,0.28)", fontSize: 18, flexShrink: 0, fontWeight: 300 }}>+</span>
                    </summary>
                    <div style={{ padding: "4px 22px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.8, margin: "12px 0 0" }}>{sig.body}</p>
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── FULL-BLEED QUOTE — mountain hiker ── */}
      <div style={{ position: "relative", height: "52vh", minHeight: 300, overflow: "hidden" }}>
        <img
          src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=1600&q=85"
          alt=""
          aria-hidden="true"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,20,10,0.62)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <blockquote style={{ fontSize: "clamp(20px, 3vw, 36px)", fontWeight: 800, color: WHITE, textAlign: "center", maxWidth: 700, lineHeight: 1.3, letterSpacing: "-1px", padding: "0 48px" }}>
            {fr
              ? "\"L'événement le plus durable est celui que vous pouvez rejoindre à pied.\""
              : "\"The most sustainable event is one you can walk to.\""}
          </blockquote>
        </div>
      </div>

      {/* ── WHEELCHAIR — accessibility graphic + note ── */}
      <section style={{ background: CREAM, padding: "80px 48px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 64, alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 280px" }}>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: RUST, textTransform: "uppercase", marginBottom: 16 }}>
                {fr ? "ACCESSIBILITÉ" : "ACCESSIBILITY"}
              </p>
              <h2 style={{ fontSize: "clamp(26px, 3vw, 44px)", fontWeight: 900, letterSpacing: "-1.5px", color: DARK, lineHeight: 1.1, marginBottom: 20 }}>
                {s.wheelchairTitle}
              </h2>
              <p style={{ fontSize: 16, color: "#666", lineHeight: 1.85 }}>{s.wheelchair}</p>
            </div>
            <div style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: 16, paddingBottom: 80 }}>
              <div style={{ background: PINE, borderRadius: 20, padding: "28px 28px", display: "flex", alignItems: "center", gap: 24 }}>
                <svg width="108" height="108" viewBox="0 0 108 108" style={{ flexShrink: 0 }} aria-hidden="true">
                  <circle cx="54" cy="54" r="44" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="9" />
                  <circle cx="54" cy="54" r="44" fill="none" stroke={STONE} strokeWidth="9"
                    strokeDasharray={String(CIRC)} strokeDashoffset={dashOffset}
                    strokeLinecap="round" transform="rotate(-90 54 54)" />
                  <text x="54" y="48" textAnchor="middle" fontSize="24" fontWeight="900" fill={WHITE} fontFamily="DM Sans, Inter, sans-serif">25</text>
                  <text x="54" y="63" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.6)" fontFamily="DM Sans, Inter, sans-serif">{fr ? "sur 68" : "of 68"}</text>
                </svg>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: WHITE, marginBottom: 6, lineHeight: 1.3 }}>
                    {fr ? "Stations accessibles" : "Accessible metro stations"}
                  </p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.7, marginBottom: 14 }}>
                    {fr
                      ? "Seulement 25 des 68 stations sont accessibles en fauteuil roulant."
                      : "Only 25 of Montréal's 68 metro stations are wheelchair-accessible."}
                  </p>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={STONE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="4.5" r="1.5" />
                    <path d="M12 7v5l3.5 2" />
                    <path d="M9 10.5H5.5L4 17.5h9l-1-4" />
                    <circle cx="14.5" cy="20.5" r="2.5" />
                  </svg>
                </div>
              </div>
              <div style={{ background: MOSS, borderRadius: 20, padding: "24px 28px", borderLeft: "4px solid " + STONE }}>
                <p style={{ fontSize: 10, fontWeight: 800, color: STONE, marginBottom: 8, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                  {fr ? "À NOTER" : "IMPORTANT NOTE"}
                </p>
                <p style={{ fontSize: 14, color: WHITE, lineHeight: 1.85 }}>
                  {fr
                    ? "Un score élevé ne garantit pas l'accessibilité en fauteuil roulant. Nous l'indiquons séparément."
                    : "A high eco-badge does not guarantee wheelchair access. We report it separately."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHEELCHAIR PHOTO — smiling/accessible people in nature ── */}
      <section style={{ position: "relative", height: "65vh", minHeight: 380, overflow: "hidden" }}>
        <img
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=85"
          alt=""
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(10,20,10,0.92) 0%, rgba(10,20,10,0.6) 55%, rgba(10,20,10,0.1) 100%)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "0 48px", height: "100%", display: "flex", alignItems: "center" }}>
          <div style={{ maxWidth: 520 }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", display: "block", marginBottom: 18 }}>
              {fr ? "03 · LA NATURE POUR TOUS" : "03 · NATURE FOR EVERYONE"}
            </span>
            <h2 style={{ fontSize: "clamp(34px, 4.5vw, 62px)", fontWeight: 900, color: WHITE, lineHeight: 0.95, letterSpacing: "-2.5px", marginBottom: 22 }}>
              {fr ? "Des événements\naccessibles\nà toutes et tous." : "Events that\neveryone can\nreach."}
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.48)", lineHeight: 1.8, maxWidth: 400 }}>
              {fr
                ? "Nous affichons l'accessibilité en fauteuil roulant séparément du score écologique, parce que chaque personne mérite de participer."
                : "We display wheelchair access separately from the eco score, because every person deserves to participate."}
            </p>
          </div>
        </div>
      </section>

      {/* ── DISCLAIMER — rounded box with thick green border ── */}
      <section style={{ background: CREAM, padding: "64px 48px 64px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ border: "3px solid " + MOSS, borderRadius: 20, padding: "28px 32px", display: "flex", gap: 18, alignItems: "flex-start", background: "#fffbf0" }}>
            <div style={{ flexShrink: 0, marginTop: 3 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#c4921a" stroke="none" aria-hidden="true">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: "#c4921a", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 6 }}>
                {s.honestTitle}
              </p>
              <p style={{ fontSize: 14, color: "#7a6535", lineHeight: 1.85, maxWidth: 820 }}>
                {honestParts.map(function(part, i) {
                  return (
                    <span key={i}>
                      {part}
                      {i < honestParts.length - 1 && (
                        <svg style={{ display: "inline", verticalAlign: "middle", margin: "0 2px" }} width="14" height="14" viewBox="0 0 24 24" fill={MOSS} stroke="none" aria-hidden="true">
                          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
                        </svg>
                      )}
                    </span>
                  );
                })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── RANKING — horizontal scroll with photo cards ── */}
      <section style={{ background: CREAM, padding: "80px 48px 100px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: RUST, textTransform: "uppercase", marginBottom: 16 }}>
            {fr ? "CLASSEMENT ÉCO" : "ECO LEADERBOARD"}
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 900, letterSpacing: "-2px", color: DARK, marginBottom: 12 }}>
            {s.rankingTitle}
          </h2>
          <p style={{ fontSize: 16, color: "#888", marginBottom: 32 }}>{s.rankingIntro}</p>
          <SustainabilityRanking dict={dict} lang={lang} />
          <p style={{ fontSize: 11, color: "#bbb", marginTop: 48, lineHeight: 1.8 }}>{s.dataNote}</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: PINE, padding: "64px 8vw 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 48, marginBottom: 48 }}>
            <div style={{ flex: "2 1 240px" }}>
              <img
                src="/MTLVerde_Logo.png"
                alt="MTLVerde"
                style={{ height: 120, marginBottom: 24, filter: "brightness(10)" }}
              />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 280 }}>
                {fr
                  ? "Montréal événements communautaires — gratuits, bilingues."
                  : "Sustainable community events in Montréal — free, bilingual, and planet-first."}
              </p>
            </div>
            <div style={{ flex: "1 1 140px" }}>
              <h4 style={{ fontSize: 10, fontWeight: 800, marginBottom: 20, color: "rgba(255,255,255,0.7)", letterSpacing: "2px", textTransform: "uppercase" }}>
                {fr ? "Compagnie" : "Company"}
              </h4>
              {footerCompany.map(function(item) {
                return (
                  <a key={item[0]} href={item[1]} style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 12, textDecoration: "none" }}>
                    {item[0]}
                  </a>
                );
              })}
            </div>
            <div style={{ flex: "1 1 140px" }}>
              <h4 style={{ fontSize: 10, fontWeight: 800, marginBottom: 20, color: "rgba(255,255,255,0.7)", letterSpacing: "2px", textTransform: "uppercase" }}>Contact</h4>
              {footerContact.map(function(item) {
                return (
                  <a key={item[0]} href={item[1]} style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 12, textDecoration: "none" }}>
                    {item[0]}
                  </a>
                );
              })}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
              {"© 2026 MTLVerde — "}{fr ? "Événements. Montréal. Ensemble." : "Events. Montreal. Together."}
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>mtlverde@gmail.com</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
