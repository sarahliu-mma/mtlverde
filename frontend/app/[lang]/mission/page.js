import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import Header from "../Header";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.mission.title,
    description: dict.mission.statement.slice(0, 155),
  };
}

export default async function Mission({ params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const m = dict.mission;

  const sections = [
    { title: m.problemTitle, body: m.problem },
    { title: m.whatTitle, body: m.what },
    { title: m.visionTitle, body: m.vision },
    { title: m.dataTitle, body: m.data },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header dict={dict} lang={lang} />

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800">{m.heading}</h1>
        <p className="text-gray-600 mt-4 text-lg leading-relaxed">{m.statement}</p>

        {sections.map((s) => (
          <section key={s.title} className="mt-8">
            <h2 className="text-xl font-semibold text-green-700">{s.title}</h2>
            <p className="text-gray-600 mt-2 leading-relaxed">{s.body}</p>
          </section>
        ))}
      </main>
    </div>
  );
}
