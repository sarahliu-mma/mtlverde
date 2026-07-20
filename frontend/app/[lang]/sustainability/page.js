// frontend/app/[lang]/sustainability/page.js
//
// The Sustainability page. Two parts:
//   1) An explainer (how we score) — static, server-rendered from the dictionary.
//   2) A live ranking of every event by sustainability score, with an
//      expandable per-event breakdown — interactive, so it lives in the
//      SustainabilityRanking client component.
//
// Mirrors the saved/ pattern: page.js (server) + a *Client component.

import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import Header from "../Header";
import SustainabilityRanking from "./SustainabilityRanking";

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

  const signals = [
    { icon: "\u{1F687}", title: s.transitTitle, body: s.transit },
    { icon: "\u{1F6B6}", title: s.walkinTitle, body: s.walkin },
    { icon: "\u{1F333}", title: s.outdoorTitle, body: s.outdoor },
  ];
  const tiers = [
    { leaves: "\u{1F33F}\u{1F33F}\u{1F33F}", body: s.tier3 },
    { leaves: "\u{1F33F}\u{1F33F}", body: s.tier2 },
    { leaves: "\u{1F33F}", body: s.tier1 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header dict={dict} lang={lang} />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800">{s.heading}</h1>
        <p className="text-gray-600 mt-4 text-lg leading-relaxed">{s.intro}</p>

        {/* How the score is built */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-green-700">{s.signalsTitle}</h2>
          <div className="mt-4 grid gap-4">
            {signals.map((sig) => (
              <div key={sig.title} className="bg-white rounded-xl shadow-sm p-5 flex items-start gap-4">
                <span className="text-2xl leading-none" aria-hidden="true">{sig.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-800">{sig.title}</h3>
                  <p className="text-gray-600 mt-1 leading-relaxed">{sig.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What the tiers mean */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-green-700">{s.tiersTitle}</h2>
          <div className="mt-4 grid gap-3">
            {tiers.map((t) => (
              <div key={t.leaves} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
                <span className="text-xl shrink-0" aria-hidden="true">{t.leaves}</span>
                <p className="text-gray-600 leading-relaxed">{t.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Wheelchair accessibility */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-green-700">{"\u267F"} {s.wheelchairTitle}</h2>
          <p className="text-gray-600 mt-2 leading-relaxed">{s.wheelchair}</p>
        </section>

        {/* Honesty note */}
        <section className="mt-10 border-l-4 border-green-600 bg-green-50 rounded-r-xl p-5">
          <h2 className="text-lg font-semibold text-gray-800">{s.honestTitle}</h2>
          <p className="text-gray-600 mt-2 leading-relaxed">{s.honest}</p>
        </section>

        {/* Live ranking of every event by score (interactive) */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-green-700">{s.rankingTitle}</h2>
          <p className="text-gray-600 mt-2 leading-relaxed">{s.rankingIntro}</p>
          <SustainabilityRanking dict={dict} lang={lang} />
        </section>

        <p className="text-xs text-gray-400 mt-10 leading-relaxed">{s.dataNote}</p>
      </main>
    </div>
  );
}
