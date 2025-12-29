import type { SupportedLocale } from "@config/types";

import { defineRouting } from "next-intl/routing";

import { defaultLocale, supportedLocales } from "@config/locale";

import { isSupportedLocale, splitPath, splitSegments } from "./helper";

export const routing = defineRouting({
  locales: supportedLocales,
  defaultLocale: defaultLocale,
});

/**
 * Add locale prefix to a pathname if not already present.
 *
 * Examples:
 * - addLocalePrefix("/about", "en") -> "/en/about"
 * - addLocalePrefix("/", "en")      -> "/en"
 * - addLocalePrefix("/en/about","en") -> "/en/about"
 */
export function addLocalePrefix(
  input: string,
  locale: SupportedLocale
): string {
  const [pathname, suffix = ""] = splitPath(input);

  const segments = splitSegments(pathname);

  // already prefixed
  if (isSupportedLocale(segments[0])) {
    return input;
  }

  // root path
  if (segments.length === 0) {
    return `/${locale}${suffix}`;
  }

  return `/${locale}/${segments.join("/")}${suffix}`;
}

/**
 * Strip locale prefix from a pathname if present.
 *
 * Examples:
 * - stripLocalePrefix("/ar/about") -> { locale: "ar", pathname: "/about" }
 * - stripLocalePrefix("/about")    -> { locale: "en", pathname: "/about" }
 * - stripLocalePrefix("/en")       -> { locale: "en", pathname: "/" }
 */
export function stripLocalePrefix(input: string): {
  locale: SupportedLocale;
  pathname: string;
} {
  const [pathname, suffix = ""] = splitPath(input);
  const segments = splitSegments(pathname);

  const first = segments[0];

  if (isSupportedLocale(first)) {
    const rest = segments.slice(1);
    return {
      locale: first,
      pathname: rest.length === 0 ? "/" : `/${rest.join("/")}${suffix}`,
    };
  }

  return {
    locale: defaultLocale,
    pathname: pathname + suffix,
  };
}
