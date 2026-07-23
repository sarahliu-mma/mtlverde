"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../Header";
import { useAuth } from "../AuthProvider";

const GREEN_DARK  = "#1e4d2b";
const GREEN_MID   = "#6a9e5a";
const RED         = "#b5281c";
const WHITE       = "#ffffff";

export default function LoginClient({ dict, lang }) {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const t = dict.auth;

  const [mode, setMode]         = useState("signin");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [info, setInfo]         = useState("");
  const [busy, setBusy]         = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const isSignup = mode === "signup";

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    const { data, error } = isSignup
      ? await signUp(email, password)
      : await signIn(email, password);
    setBusy(false);
    if (error) { setError(error.message); return; }
    if (isSignup && !data.session) { setInfo(t.checkEmail); return; }
    router.push(`/${lang}/saved`);
  }

  function switchMode() {
    setMode(isSignup ? "signin" : "signup");
    setError("");
    setInfo("");
  }

  const inputStyle = (field) => ({
    width: "100%",
    border: "none",
    borderBottom: `1.5px solid ${focusedField === field ? WHITE : "rgba(255,255,255,0.4)"}`,
    borderRadius: 0,
    padding: "12px 0",
    fontSize: 16,
    color: WHITE,
    background: "transparent",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  });

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'DM Sans','Inter',sans-serif", position: "relative", display: "flex", flexDirection: "column" }}>

      {/* Full-page nature background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <img
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1800&q=85"
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,20,10,0.62)" }} />
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>

        <Header dict={dict} lang={lang} />

        <main style={{ flex: 1, maxWidth: 1100, margin: "0 auto", width: "100%", padding: "120px 48px 100px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>

          {/* ── LEFT: Form ── */}
          <div>
            {/* MTLVerde logo */}
            <img
              src="/MTLVerde_Logo.png"
              alt="MTLVerde"
              style={{ height: 56, marginBottom: 36, filter: "brightness(10)" }}
              onError={e => { e.currentTarget.style.display = "none"; }}
            />

            <h1 style={{ fontSize: "clamp(40px, 5vw, 68px)", fontWeight: 900, letterSpacing: "-2px", lineHeight: 1, marginBottom: 48, color: WHITE }}>
              {isSignup ? t.signUpHeading : t.signInHeading + "."}
            </h1>

            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 36 }}>
              <label style={{ display: "block" }}>
                <span style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>{t.email} *</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  style={inputStyle("email")}
                />
              </label>

              <label style={{ display: "block" }}>
                <span style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>{t.password} *</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  style={inputStyle("password")}
                />
              </label>

              {error && <p style={{ fontSize: 13, color: "#f87171", margin: 0 }}>{error}</p>}
              {info  && <p style={{ fontSize: 13, color: "#86efac", margin: 0 }}>{info}</p>}

              <div>
                <button
                  type="submit"
                  disabled={busy}
                  style={{
                    background: busy ? "rgba(255,255,255,0.3)" : WHITE,
                    color: busy ? WHITE : "#111",
                    border: "none",
                    borderRadius: 999,
                    padding: "16px 52px",
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: busy ? "default" : "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { if (!busy) { e.currentTarget.style.background = "rgba(255,255,255,0.88)"; } }}
                  onMouseLeave={e => { if (!busy) { e.currentTarget.style.background = WHITE; } }}
                >
                  {busy ? t.working : isSignup ? t.signUpAction : t.signInAction}
                </button>
              </div>

              <div>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>
                  {isSignup ? (lang === "fr" ? "Déjà membre ?" : "Already have an account?") : (lang === "fr" ? "Pas encore membre ?" : "Don't have an account?")}
                </p>
                <button
                  type="button"
                  onClick={switchMode}
                  style={{ background: "none", border: "none", fontSize: 14, color: WHITE, fontWeight: 700, cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 4 }}
                >
                  {isSignup ? (lang === "fr" ? "Se connecter" : "Sign in") : (lang === "fr" ? "Créer un compte" : "Create One Now")}
                </button>
              </div>
            </form>
          </div>

          {/* ── RIGHT: Dark card ── */}
          <div style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", padding: "52px 44px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 360 }}>
            <div>
              <h2 style={{ fontSize: 30, fontWeight: 900, color: WHITE, letterSpacing: "-0.5px", lineHeight: 1.2, marginBottom: 16 }}>
                {isSignup
                  ? (lang === "fr" ? "Déjà membre ?" : "Already a member?")
                  : (lang === "fr" ? "Nouveau sur MTLVerde ?" : "New to MTLVerde?")}
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.85, marginBottom: 40 }}>
                {isSignup
                  ? (lang === "fr"
                      ? "Connectez-vous pour accéder à vos événements sauvegardés et vos suggestions personnalisées."
                      : "Sign in to access your saved events and personalized recommendations.")
                  : (lang === "fr"
                      ? "Créez un compte gratuit pour sauvegarder vos événements préférés et y accéder depuis n'importe quel appareil."
                      : "Create a free account to save your favourite events and find them on any device.")}
              </p>
            </div>
            <button
              type="button"
              onClick={switchMode}
              style={{
                background: "transparent",
                color: WHITE,
                border: "2px solid rgba(255,255,255,0.35)",
                borderRadius: 999,
                padding: "14px 36px",
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                transition: "all 0.2s",
                alignSelf: "flex-start",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = WHITE; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}
            >
              {isSignup
                ? (lang === "fr" ? "Se connecter" : "Sign in")
                : (lang === "fr" ? "Créer un compte" : "Create an account")}
            </button>
          </div>

        </main>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ position: "relative", zIndex: 1, background: GREEN_DARK, color: WHITE, padding: "72px 48px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 1fr", gap: 48, marginBottom: 56 }}>
            <div>
              <img
                src="/MTLVerde_Logo.png"
                alt="MTLVerde"
                style={{ height: 72, marginBottom: 20, filter: "brightness(10)" }}
                onError={e => { e.currentTarget.style.display = "none"; }}
              />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, maxWidth: 280 }}>
                {lang === "fr"
                  ? "Découvrir la vie communautaire à Montréal — gratuit, bilingue, et conçu pour les nouveaux arrivants."
                  : "Discover community life in Montreal — free, bilingual, and built for newcomers."}
              </p>
            </div>
            {[
              { heading: lang === "fr" ? "Compagnie" : "Company", links: [lang === "fr" ? "À propos" : "About", "Press", "Careers"] },
              { heading: "Contact",                                 links: ["Help/FAQ", lang === "fr" ? "Équipe" : "Team", "mtlverde@gmail.com"] },
              { heading: lang === "fr" ? "Plus" : "More",          links: [lang === "fr" ? "Données ouvertes" : "Open Data", lang === "fr" ? "Accessibilité" : "Accessibility", lang === "fr" ? "Confidentialité" : "Privacy"] },
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
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© 2026 MTLVerde — Events. Montreal. Together.</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>mtlverde@gmail.com</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
