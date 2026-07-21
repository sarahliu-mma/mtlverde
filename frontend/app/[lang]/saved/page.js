import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import SavedClient from "./SavedClient";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.saved.title };
}

export default async function Saved({ params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  return <SavedClient dict={dict} lang={lang} />;
}
