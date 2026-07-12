import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "./dictionaries";
import HomeClient from "./HomeClient";

export default async function Home({ params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  return <HomeClient dict={dict} lang={lang} />;
}
