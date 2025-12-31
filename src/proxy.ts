import { NextResponse, type NextRequest } from "next/server";

import { detectLocale } from "@i18n/request";
import { addLocalePrefix, stripLocalePrefix } from "@i18n/routing";

/**
 * Cookie name used by next-intl conventions.
 * You can change it, but keep it consistent across the app.
 */
const LOCALE_COOKIE = "local";

/**
 * Decide whether we should skip locale redirect for a given pathname.
 * (You don't want to redirect _next assets, api routes, or real files.)
 */
function shouldBypass(pathname: string): boolean {
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/api")) return true;

  if (
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return true;
  }

  const last = pathname.split("/").pop() ?? "";
  if (last.includes(".") && !last.startsWith(".")) return true;

  return false;
}

/**
 * Proxy that redirects users to a locale-prefixed route (/en or /ar)
 * when they hit a non-prefixed route.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (shouldBypass(pathname)) {
    return NextResponse.next();
  }

  const { pathname: strippedPathname } = stripLocalePrefix(pathname);
  const alreadyPrefixed = strippedPathname !== pathname;
  if (alreadyPrefixed) {
    return NextResponse.next();
  }

  const locale = detectLocale({
    pathname,
    cookieLocale: request.cookies.get(LOCALE_COOKIE)?.value ?? null,
    acceptLanguage: request.headers.get("accept-language"),
  });

  const url = request.nextUrl.clone();
  url.pathname = addLocalePrefix(pathname, locale);

  const res = NextResponse.redirect(url);

  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
  });

  return res;
}

export const config = {
  matcher: ["/((?!_next|api).*)"],
};
