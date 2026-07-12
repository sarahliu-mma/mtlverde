import { NextResponse } from "next/server";

// Kept in sync with app/[lang]/dictionaries.js. Inlined here because Proxy runs
// before the app and must not import the "server-only" dictionaries module.
const locales = ["fr", "en"];
const defaultLocale = "fr";

// Pick a locale from the browser's Accept-Language header, defaulting to French.
function getLocale(request) {
  const header = request.headers.get("accept-language");
  if (header) {
    // Take the highest-priority language tag and match on its base language.
    const preferred = header.split(",")[0].trim().split("-")[0].toLowerCase();
    if (locales.includes(preferred)) return preferred;
  }
  return defaultLocale;
}

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Skip if the pathname already starts with a supported locale.
  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasLocale) return;

  // Otherwise redirect to the locale-prefixed URL (e.g. /  ->  /fr).
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Run on everything except Next internals, the API, and static asset files.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
