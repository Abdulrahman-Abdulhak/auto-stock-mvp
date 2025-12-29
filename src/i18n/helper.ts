import type { SupportedLocale } from "@config/types";

import { supportedLocales } from "@config/locale";

export function isSupportedLocale(
  value: string | undefined
): value is SupportedLocale {
  return !!value && (supportedLocales as readonly string[]).includes(value);
}

export function getLocaleFromPathname(
  pathname: string
): SupportedLocale | null {
  const purePath = pathname.split("?")[0].split("#")[0];
  const firstSeg = purePath.split("/").filter(Boolean)[0];
  return normalizeToSupportedLocale(firstSeg);
}

export function normalizeToSupportedLocale(
  value?: string | null
): SupportedLocale | null {
  if (!value) return null;

  const v = value.trim();
  if (!v) return null;

  // exact match: "ar"
  if (isSupportedLocale(v)) return v;

  // handle region tags: "ar-SY" -> "ar"
  const base = v.split("-")[0];
  if (isSupportedLocale(base)) return base;

  return null;
}

export function getLocaleFromAcceptLanguage(
  header?: string | null
): SupportedLocale | null {
  if (!header) return null;

  // Parse: "ar,en;q=0.8,fr;q=0.7"
  // We’ll sort by q (quality) descending, default q=1.
  const candidates = header
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [tagPart, ...params] = part.split(";").map((s) => s.trim());
      const qParam = params.find((p) => p.startsWith("q="));
      const q = qParam ? Number(qParam.slice(2)) : 1;
      return { tag: tagPart, q: Number.isFinite(q) ? q : 0 };
    })
    .sort((a, b) => b.q - a.q);

  for (const c of candidates) {
    const loc = normalizeToSupportedLocale(c.tag);
    if (loc) return loc;
  }

  return null;
}

export function splitPath(input: string): [string, string] {
  const match = input.match(/^([^?#]*)(.*)$/);
  return match ? [match[1], match[2]] : [input, ""];
}

export function splitSegments(pathname: string): string[] {
  return pathname.split("/").filter(Boolean);
}
