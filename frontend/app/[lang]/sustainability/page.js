// frontend/app/[lang]/sustainability/page.js

import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import Header from "../Header";
import Collapsible from "./Collapsible";
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
    { icon: "🚇", title: s.transitTitle, body: s.transit },
    { icon: "🚶", title: s.walkinTitle, body: s.walkin },
    { icon: "🌳", title: s.outdoorTitle, body: s.outdoor },
  ];
  const tiers = [
    { leaves: "🌿🌿🌿", body: s.tier3 },
    { leaves: "🌿🌿", body: s.tier2 },
    { leaves: "🌿", body: s.tier1 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header dict={dict} lang={lang} />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800">{s.heading}</h1>
        <p className="text-gray-600 mt-4 text-lg leading-relaxed">{s.intro}</p>

        {/* 1. What the leaves mean — always visible, moved to top */}
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

        {/* 2. What goes into the score — collapsible, includes the weights rationale */}
        <section className="mt-6">
          <Collapsible title={s.signalsTitle}>
            <div className="mt-2 grid gap-4">
              {signals.map((sig) => (
                <div key={sig.title} className="flex items-start gap-4">
                  <span className="text-2xl leading-none" aria-hidden="true">{sig.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">{sig.title}</h3>
                    <p className="text-gray-600 mt-1 leading-relaxed">{sig.body}</p>
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-800">{s.whyWeightsTitle}</h3>
                <p className="text-gray-600 mt-1 leading-relaxed">{s.whyWeights}</p>
              </div>
            </div>
          </Collapsible>
        </section>

        {/* 3. Wheelchair accessibility — always visible */}
        <section className="mt-6">
          <h2 className="text-xl font-semibold text-green-700">♿ {s.wheelchairTitle}</h2>
          <p className="text-gray-600 mt-2 leading-relaxed">{s.wheelchair}</p>
        </section>

        {/* 4. What this score is not — collapsible */}
        <section className="mt-6">
          <Collapsible title={s.honestTitle}>
            <p className="text-gray-600 mt-2 leading-relaxed">{s.honest}</p>
          </Collapsible>
        </section>

        {/* 5. Every event, ranked by score — interactive */}
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
