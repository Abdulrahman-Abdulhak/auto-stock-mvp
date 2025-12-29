import type { SupportedLocale } from "@config/types";

import {
  getRequestConfig,
  type GetRequestConfigParams,
} from "next-intl/server";

import { defaultLocale, supportedLocales } from "@config/locale";

import {
  getLocaleFromAcceptLanguage,
  getLocaleFromPathname,
  normalizeToSupportedLocale,
} from "./helper";

export default getRequestConfig(
  async ({ requestLocale, locale: explicitLocale }: GetRequestConfigParams) => {
    const segmentLocale = await requestLocale;
    const maybeLocale = explicitLocale ?? segmentLocale;

    const locale = supportedLocales.includes(maybeLocale as any)
      ? (maybeLocale as SupportedLocale)
      : defaultLocale;

    return {
      locale,
      messages: (await import(`../../messages/${locale}.json`)).default,
    };
  }
);

type DetectLocaleInput = {
  pathname: string;
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
};

export function detectLocale({
  pathname,
  cookieLocale,
  acceptLanguage,
}: DetectLocaleInput): SupportedLocale {
  // 1) Path prefix wins
  const fromPath = getLocaleFromPathname(pathname);
  if (fromPath) return fromPath;

  // 2) Cookie wins over Accept-Language
  const fromCookie = normalizeToSupportedLocale(cookieLocale);
  if (fromCookie) return fromCookie;

  // 3) Accept-Language
  const fromHeader = getLocaleFromAcceptLanguage(acceptLanguage);
  if (fromHeader) return fromHeader;

  // 4) Fallback
  return defaultLocale;
}
