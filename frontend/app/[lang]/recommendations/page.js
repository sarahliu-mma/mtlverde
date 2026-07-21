// frontend/app/[lang]/recommendations/page.js
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import RecommendationsClient from "./RecommendationsClient";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.recommendations.title };
}

export default async function Recommendations({ params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <RecommendationsClient dict={dict} lang={lang} />;
}

