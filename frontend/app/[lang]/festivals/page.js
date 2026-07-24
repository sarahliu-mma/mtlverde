import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import FestivalsClient from "./FestivalsClient";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.festivals.title,
    description: dict.festivals.intro.slice(0, 155),
  };
}

export default async function Festivals({ params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  return <FestivalsClient dict={dict} lang={lang} />;
}
