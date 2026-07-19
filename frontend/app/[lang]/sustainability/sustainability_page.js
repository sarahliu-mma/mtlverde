// frontend/app/[lang]/sustainability/page.js
//
// The "How we score" page. Mirrors the mission page pattern: server component,
// reads all copy from the dictionary (dict.sustainability.*) so it stays
// bilingual, and reuses the shared Header.

import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import Header from "../Header";

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

  // The three scored signals, with their weights and leaf icon.
  const signals = [
    { icon: "🚇", title: s.transitTitle, body: s.transit },
    { icon: "🚶", title: s.walkinTitle, body: s.walkin },
    { icon: "🌳", title: s.outdoorTitle, body: s.outdoor },
  ];

  // The three badge tiers.
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

        {/* Three weighted signals */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-green-700">{s.signalsTitle}</h2>
          <div className="mt-4 grid gap-4">
            {signals.map((sig) => (
              <div
                key={sig.title}
                className="bg-white rounded-xl shadow-sm p-5 flex items-start gap-4"
              >
                <span className="text-2xl leading-none" aria-hidden="true">
                  {sig.icon}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-800">{sig.title}</h3>
                  <p className="text-gray-600 mt-1 leading-relaxed">{sig.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Badge tiers */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-green-700">{s.tiersTitle}</h2>
          <div className="mt-4 grid gap-3">
            {tiers.map((t) => (
              <div
                key={t.leaves}
                className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4"
              >
                <span className="text-xl shrink-0" aria-hidden="true">
                  {t.leaves}
                </span>
                <p className="text-gray-600 leading-relaxed">{t.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Wheelchair accessibility */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-green-700">
            ♿ {s.wheelchairTitle}
          </h2>
          <p className="text-gray-600 mt-2 leading-relaxed">{s.wheelchair}</p>
        </section>

        {/* Honesty note */}
        <section className="mt-10 border-l-4 border-green-600 bg-green-50 rounded-r-xl p-5">
          <h2 className="text-lg font-semibold text-gray-800">{s.honestTitle}</h2>
          <p className="text-gray-600 mt-2 leading-relaxed">{s.honest}</p>
        </section>

        <p className="text-xs text-gray-400 mt-10 leading-relaxed">{s.dataNote}</p>
      </main>
    </div>
  );
}
