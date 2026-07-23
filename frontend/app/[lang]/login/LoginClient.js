"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../Header";
import { useAuth } from "../AuthProvider";

const GREEN_DARK  = "#1e4d2b";
const GREEN_MID   = "#6a9e5a";
const GREEN_LIGHT = "#e8f0e4";
const CREAM       = "#f9f6f1";
const RED         = "#b5281c";
const DARK        = "#111";

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

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'DM Sans','Inter',sans-serif", position: "relative", background: CREAM }}>

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <img
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1800&q=85"
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(30,77,43,0.80) 0%, rgba(0,0,0,0.50) 60%, rgba(181,40,28,0.30) 100%)" }} />
      </div>

      {/* Header */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <Header dict={dict} lang={lang} />
      </div>

      {/* Card */}
      <main style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "100px 24px 60px" }}>
        <div style={{ width: "100%", maxWidth: 420, background: "rgba(249,246,241,0.97)", borderRadius: 24, padding: "44px 40px 40px", boxShadow: "0 32px 80px rgba(0,0,0,0.35)" }}>

          {/* Logo mark */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: GREEN_DARK, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 900, color: DARK, letterSpacing: "-0.5px", marginBottom: 8, textAlign: "center" }}>
            {isSignup ? t.signUpHeading : t.signInHeading}
          </h1>
          <p style={{ fontSize: 13, color: "#888", lineHeight: 1.7, textAlign: "center", marginBottom: 32 }}>
            {t.subtitle}
          </p>

          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <label style={{ display: "block" }}>
              <span style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>
                {t.email}
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", border: "1.5px solid #e0dbd4", borderRadius: 12, padding: "12px 16px", fontSize: 14, color: DARK, background: "#fff", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={e => { e.currentTarget.style.borderColor = GREEN_MID; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#e0dbd4"; }}
              />
            </label>

            <label style={{ display: "block" }}>
              <span style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>
                {t.password}
              </span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={isSignup ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", border: "1.5px solid #e0dbd4", borderRadius: 12, padding: "12px 16px", fontSize: 14, color: DARK, background: "#fff", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={e => { e.currentTarget.style.borderColor = GREEN_MID; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#e0dbd4"; }}
              />
            </label>

            {error && (
              <p style={{ fontSize: 13, color: RED, background: "#fdf0ee", borderRadius: 8, padding: "10px 14px", margin: 0 }}>{error}</p>
            )}
            {info && (
              <p style={{ fontSize: 13, color: GREEN_DARK, background: GREEN_LIGHT, borderRadius: 8, padding: "10px 14px", margin: 0 }}>{info}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              style={{ background: busy ? "#ccc" : GREEN_DARK, color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 800, cursor: busy ? "default" : "pointer", transition: "background 0.2s", marginTop: 4 }}
              onMouseEnter={e => { if (!busy) e.currentTarget.style.background = "#163d21"; }}
              onMouseLeave={e => { if (!busy) e.currentTarget.style.background = GREEN_DARK; }}
            >
              {busy ? t.working : isSignup ? t.signUpAction : t.signInAction}
            </button>
          </form>

          <div style={{ borderTop: "1px solid #ede8e0", marginTop: 28, paddingTop: 22, textAlign: "center" }}>
            <button
              type="button"
              onClick={() => { setMode(isSignup ? "signin" : "signup"); setError(""); setInfo(""); }}
              style={{ background: "none", border: "none", fontSize: 13, color: GREEN_MID, fontWeight: 700, cursor: "pointer", padding: 0 }}
              onMouseEnter={e => { e.currentTarget.style.color = GREEN_DARK; }}
              onMouseLeave={e => { e.currentTarget.style.color = GREEN_MID; }}
            >
              {isSignup ? t.toSignIn : t.toSignUp}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
