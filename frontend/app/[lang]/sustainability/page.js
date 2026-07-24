// frontend/app/[lang]/sustainability/page.js
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import Header from "../Header";
import Collapsible from "./Collapsible";
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
    { label: fr ? "CHEF DE FILE VERT" : "GREEN LEADER", range: "90–100", body: s.tier3, color: MOSS,  leaves: 3 },
    { label: fr ? "ÉCO-RESPONSABLE"   : "ECO-FRIENDLY",  range: "65–89",  body: s.tier2, color: SAGE,  leaves: 2 },
    { label: fr ? "EN CHEMIN"          : "GETTING THERE", range: "0–64",   body: s.tier1, color: STONE, leaves: 1 },
  ];

  const footerCompany = fr
    ? [["À propos", `/${lang}#about`], ["Presse", `/${lang}#press`], ["Carrières", `/${lang}#careers`]]
    : [["About",    `/${lang}#about`], ["Press",  `/${lang}#press`], ["Careers",  `/${lang}#careers`]];

  const footerContact = [
    ["Help / FAQ", `/${lang}#faq`],
    ["Team",       `/${lang}#team`],
    ["mtlverde@gmail.com", "mailto:mtlverde@gmail.com"],
  ];

  return (
    <div style={{ fontFamily: "'DM Sans','Inter',sans-serif", background: CREAM, color: DARK, margin: 0, padding: 0 }}>

      <Header dict={dict} lang={lang} />

      {/* HERO */}
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
          {/* Big word */}
          <h1 style={{ fontSize: "clamp(64px, 11vw, 140px)", fontWeight: 900, lineHeight: 0.88, letterSpacing: "-5px", color: WHITE, marginBottom: 24 }}>
            {fr ? "Durabilité" : "Sustainability"}
          </h1>
          {/* Italic quote */}
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

      {/* HOW WE SCORE — editorial section */}
      <section style={{ background: WHITE, padding: "96px 48px", borderBottom: "1px solid #eee" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 64, alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 340px" }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: RUST, textTransform: "uppercase", marginBottom: 20 }}>
              {fr ? "COMMENT NOUS ÉVALUONS" : "HOW WE SCORE"}
            </p>
            <h2 style={{ fontSize: "clamp(36px, 5vw, 68px)", fontWeight: 900, letterSpacing: "-2.5px", lineHeight: 0.95, color: DARK, margin: 0 }}>
              {fr ? "Chaque événement\na son score." : "Every event\nhas a score."}
            </h2>
          </div>
          <div style={{ flex: "1 1 340px", paddingTop: 8 }}>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 18px)", color: "#555", lineHeight: 1.85, marginBottom: 24 }}>
              {s.intro}
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { n: "45", label: fr ? "pts transport" : "pts transit" },
                { n: "35", label: fr ? "pts piéton"    : "pts walk-in" },
                { n: "20", label: fr ? "pts extérieur"  : "pts outdoor" },
              ].map(function(stat) {
                return (
                  <div key={stat.n} style={{ background: CREAM, borderRadius: 14, padding: "18px 22px", minWidth: 100 }}>
                    <p style={{ fontSize: 28, fontWeight: 900, color: DARK, letterSpacing: "-1px", margin: 0 }}>{stat.n}</p>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "1px", margin: "4px 0 0" }}>{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* TIERS */}
      <section style={{ background: WHITE, padding: "100px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: RUST, textTransform: "uppercase", marginBottom: 16 }}>
            {fr ? "LES NIVEAUX" : "THE TIERS"}
          </p>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 50px)", fontWeight: 900, letterSpacing: "-1.5px", color: DARK, marginBottom: 48, lineHeight: 1.1 }}>
            {s.tiersTitle}
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            {tiers.map(function(tier) {
              return (
                <div key={tier.label} style={{ flex: "1 1 280px", background: CREAM, borderRadius: 20, padding: "36px 28px", borderTop: "4px solid " + tier.color }}>
                  {/* Leaf icons: filled for earned, faded outline for unearned */}
                  <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
                    {Array.from({ length: tier.leaves }).map(function(_, i) {
                      return (
                        <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill={tier.color} stroke="none" aria-hidden="true">
                          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
                        </svg>
                      );
                    })}
                    {Array.from({ length: 3 - tier.leaves }).map(function(_, i) {
                      return (
                        <svg key={"e" + i} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tier.color} strokeWidth="1.5" opacity="0.25" aria-hidden="true">
                          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
                        </svg>
                      );
                    })}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "2px", color: tier.color, textTransform: "uppercase", display: "block", marginBottom: 12 }}>
                    {tier.label}
                  </span>
                  <span style={{ fontSize: 32, fontWeight: 900, color: DARK, display: "block", marginBottom: 16, letterSpacing: "-1.5px" }}>
                    {tier.range}
                  </span>
                  <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8 }}>{tier.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW WE SCORE */}
      <section style={{ background: PINE, padding: "100px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 72, alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 300px" }}>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: SAGE, textTransform: "uppercase", marginBottom: 16 }}>
                {fr ? "NOTRE MÉTHODOLOGIE" : "OUR METHODOLOGY"}
              </p>
              <h2 style={{ fontSize: "clamp(26px, 3vw, 44px)", fontWeight: 900, letterSpacing: "-1.5px", color: WHITE, lineHeight: 1.1, marginBottom: 16 }}>
                {s.signalsTitle}
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.8 }}>
                {s.whyWeights}
              </p>
            </div>
            <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 14 }}>
              {signals.map(function(sig) {
                return (
                  <div key={sig.title} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 16, padding: "22px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ flexShrink: 0 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "2px", color: SAGE, textTransform: "uppercase", display: "block", marginBottom: 4 }}>{sig.tag}</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: SAGE }}>{sig.max}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 800, color: WHITE, marginBottom: 5 }}>{sig.title}</h3>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{sig.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FULL-BLEED QUOTE */}
      <div style={{ position: "relative", height: "52vh", minHeight: 300, overflow: "hidden" }}>
        <img
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=85"
          alt=""
          aria-hidden="true"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,20,10,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <blockquote style={{ fontSize: "clamp(20px, 3vw, 36px)", fontWeight: 800, color: WHITE, textAlign: "center", maxWidth: 700, lineHeight: 1.3, letterSpacing: "-1px", padding: "0 48px" }}>
            {fr
              ? "\"L'événement le plus durable est celui que vous pouvez rejoindre à pied.\""
              : "\"The most sustainable event is one you can walk to.\""}
          </blockquote>
        </div>
      </div>

      {/* WHEELCHAIR */}
      <section style={{ background: CREAM, padding: "80px 48px" }}>
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
            <div style={{ flex: "1 1 280px", background: WHITE, borderRadius: 20, padding: "36px 32px", borderLeft: "4px solid " + MOSS }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: MOSS, marginBottom: 10, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                {fr ? "À NOTER" : "IMPORTANT NOTE"}
              </p>
              <p style={{ fontSize: 15, color: "#444", lineHeight: 1.85 }}>
                {fr
                  ? "Seulement 25 des 68 stations de métro de Montréal sont accessibles. Un score élevé ne garantit pas l'accessibilité en fauteuil roulant."
                  : "Only 25 of Montréal's 68 metro stations are wheelchair-accessible. A high eco-badge does not guarantee wheelchair access."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT THIS SCORE IS NOT */}
      <section style={{ background: WHITE, padding: "40px 48px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Collapsible title={s.honestTitle}>
            <p style={{ fontSize: 15, color: "#555", lineHeight: 1.85, marginTop: 16 }}>{s.honest}</p>
          </Collapsible>
        </div>
      </section>

      {/* RANKING */}
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

      {/* FOOTER */}
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
