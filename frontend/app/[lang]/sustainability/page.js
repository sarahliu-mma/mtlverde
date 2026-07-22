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
    { tag: fr ? "TRANSIT" : "TRANSIT",     title: s.transitTitle, body: s.transit, max: "45 pts" },
    { tag: fr ? "ACCÈS PIÉTON" : "WALK-IN", title: s.walkinTitle,  body: s.walkin,  max: "35 pts" },
    { tag: fr ? "EXTÉRIEUR" : "OUTDOOR",    title: s.outdoorTitle, body: s.outdoor, max: "20 pts" },
  ];

  const tiers = [
    { label: fr ? "CHEF DE FILE VERT" : "GREEN LEADER", range: "90–100", body: s.tier3, color: MOSS  },
    { label: fr ? "ÉCO-RESPONSABLE"   : "ECO-FRIENDLY",  range: "65–89",  body: s.tier2, color: SAGE  },
    { label: fr ? "EN CHEMIN"          : "GETTING THERE", range: "0–64",   body: s.tier1, color: STONE },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans','Inter',sans-serif", background: CREAM, color: DARK, margin: 0, padding: 0 }}>

      <style>{`
        * { box-sizing: border-box; }
        .sust-tiers { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        .sust-method { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; }
        .sust-wc { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .fl { display: block; font-size: 13px; color: rgba(255,255,255,.4); margin-bottom: 12px; text-decoration: none; transition: color .2s; }
        .fl:hover { color: rgba(255,255,255,.85); }
        .ft-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
        @media (max-width: 900px) {
          .sust-tiers  { grid-template-columns: 1fr; }
          .sust-method { grid-template-columns: 1fr; gap: 40px; }
          .sust-wc     { grid-template-columns: 1fr; gap: 32px; }
          .ft-grid     { grid-template-columns: 1fr 1fr; gap: 32px; }
        }
        @media (max-width: 560px) {
          .ft-grid { grid-template-columns: 1fr; }
        }
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
          <h1 style={{ fontSize: "clamp(44px, 8vw, 108px)", fontWeight: 900, lineHeight: 0.9, letterSpacing: "-4px", color: WHITE, marginBottom: 28, maxWidth: 820 }}>
            {s.heading}
          </h1>
          <p style={{ fontSize: "clamp(15px, 1.6vw, 19px)", color: "rgba(255,255,255,0.65)", lineHeight: 1.8, maxWidth: 520 }}>
            {s.intro}
          </p>
        </div>
        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.35 }}>
          <div style={{ width: 1, height: 44, background: WHITE }} />
          <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "3px", color: WHITE, textTransform: "uppercase" }}>scroll</span>
        </div>
      </section>

      {/* ── TIERS ── */}
      <section style={{ background: WHITE, padding: "100px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: RUST, textTransform: "uppercase", marginBottom: 16 }}>
            {fr ? "LES NIVEAUX" : "THE TIERS"}
          </p>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 50px)", fontWeight: 900, letterSpacing: "-1.5px", color: DARK, marginBottom: 48, lineHeight: 1.1 }}>
            {s.tiersTitle}
          </h2>
          <div className="sust-tiers">
            {tiers.map(tier => (
              <div key={tier.label} style={{ background: CREAM, borderRadius: 20, padding: "36px 28px", borderTop: `4px solid ${tier.color}` }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "2px", color: tier.color, textTransform: "uppercase", display: "block", marginBottom: 12 }}>
                  {tier.label}
                </span>
                <span style={{ fontSize: 32, fontWeight: 900, color: DARK, display: "block", marginBottom: 16, letterSpacing: "-1.5px" }}>
                  {tier.range}
                </span>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8 }}>{tier.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW WE SCORE ── */}
      <section style={{ background: PINE, padding: "100px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="sust-method">
            <div>
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
            <div style={{ display: "grid", gap: 14 }}>
              {signals.map(sig => (
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
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FULL-BLEED QUOTE ── */}
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

      {/* ── WHEELCHAIR ── */}
      <section style={{ background: CREAM, padding: "80px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="sust-wc">
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: RUST, textTransform: "uppercase", marginBottom: 16 }}>
                {fr ? "ACCESSIBILITÉ" : "ACCESSIBILITY"}
              </p>
              <h2 style={{ fontSize: "clamp(26px, 3vw, 44px)", fontWeight: 900, letterSpacing: "-1.5px", color: DARK, lineHeight: 1.1, marginBottom: 20 }}>
                {s.wheelchairTitle}
              </h2>
              <p style={{ fontSize: 16, color: "#666", lineHeight: 1.85 }}>{s.wheelchair}</p>
            </div>
            <div style={{ background: WHITE, borderRadius: 20, padding: "36px 32px", borderLeft: `4px solid ${MOSS}` }}>
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

      {/* ── WHAT THIS SCORE IS NOT ── */}
      <section style={{ background: WHITE, padding: "40px 48px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Collapsible title={s.honestTitle}>
            <p style={{ fontSize: 15, color: "#555", lineHeight: 1.85, marginTop: 16 }}>{s.honest}</p>
          </Collapsible>
        </div>
      </section>

      {/* ── RANKING ── */}
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
          <div className="ft-grid">
            <div>
              <img src="/MTLVerde_Logo.png" alt="MTLVerde"
                style={{ height: 120, marginBottom: 24, filter: "brightness(10)" }}
              />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 280 }}>
                {fr
                  ? "Événements communautaires durables à Montréal — gratuits, bilingues et axés sur la planète."
                  : "Sustainable community events in Montréal — free, bilingual, and planet-first."}
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
