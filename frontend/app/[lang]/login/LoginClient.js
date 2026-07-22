"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../Header";
import { useAuth } from "../AuthProvider";

// Email + password sign-in / sign-up. On success we send the user to their
// saved page. If email confirmation is on, sign-up returns no session yet, so
// we show a "check your email" note instead of redirecting.
export default function LoginClient({ dict, lang }) {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const t = dict.auth;

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

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

    if (error) {
      setError(error.message);
      return;
    }
    // Sign-up with email confirmation on: no session yet, ask them to confirm.
    if (isSignup && !data.session) {
      setInfo(t.checkEmail);
      return;
    }
    router.push(`/${lang}/saved`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header dict={dict} lang={lang} />

      <main className="max-w-md mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow p-8">
          <h1 className="text-2xl font-bold text-gray-800">
            {isSignup ? t.signUpHeading : t.signInHeading}
          </h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">{t.subtitle}</p>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <label className="block">
              <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t.email}</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t.password}</span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={isSignup ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {info && <p className="text-sm text-green-700">{info}</p>}

            <button
              type="submit"
              disabled={busy}
              className="bg-green-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-green-800 transition disabled:opacity-60"
            >
              {busy ? t.working : isSignup ? t.signUpAction : t.signInAction}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(isSignup ? "signin" : "signup");
              setError("");
              setInfo("");
            }}
            className="mt-5 text-sm text-green-700 hover:underline"
          >
            {isSignup ? t.toSignIn : t.toSignUp}
          </button>
        </div>
      </main>
    </div>
  );
}
