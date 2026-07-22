import { getDictionary } from "../dictionaries";
import MissionClient from "./MissionClient";

export default async function Page({ params }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return <MissionClient lang={lang} dict={dict} />;
}
