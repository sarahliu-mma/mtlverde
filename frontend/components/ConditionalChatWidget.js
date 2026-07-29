"use client";

import { usePathname } from "next/navigation";
import ChatWidget from "@/components/ChatWidget";

// Hide the floating chat widget on the dedicated Ask MTLVerde
// (/recommendations) page, since that page already has its own full-page
// chat interface — showing both at once would be redundant.
export default function ConditionalChatWidget({ lang, dict }) {
  const pathname = usePathname();
  const isRecommendationsPage = pathname?.endsWith("/recommendations");

  if (isRecommendationsPage) return null;

  return <ChatWidget lang={lang} dict={dict} />;
}
