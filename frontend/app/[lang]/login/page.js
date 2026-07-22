import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import LoginClient from "./LoginClient";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.auth.logIn} — MTLVerde` };
}

export default async function Login({ params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  return <LoginClient dict={dict} lang={lang} />;
}
