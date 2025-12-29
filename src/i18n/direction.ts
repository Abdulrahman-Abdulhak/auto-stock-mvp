/**
 * Set of language identifiers whose primary writing direction is right-to-left.
 *
 * This collection is used to determine layout direction at runtime based on
 * the language component of a locale identifier.
 *
 * The values represent language codes (not region-specific variants), allowing
 * the direction logic to remain stable even when locales include additional
 * qualifiers such as regions or scripts.
 *
 * This set is intentionally centralized to make it easy to extend RTL support
 * without touching layout or rendering logic.
 */
export const RTL_LANGS = new Set([
  "ar",
  "he",
  "iw",
  "fa",
  "ur",
  "ps",
  "sd",
  "ckb",
  "ug",
  "dv",
  "yi",
  "syr",
  "myz",
  "nqo",
]);

/**
 * Resolves the text and layout direction for a given locale.
 *
 * This function derives directionality from the language component of a locale
 * identifier rather than relying on region or formatting conventions.
 *
 * It acts as a single source of truth for direction decisions, ensuring
 * consistent behavior across layout, styling, and rendering layers.
 *
 * @param locale - A locale identifier that may include language and region
 * components (e.g. language-only or language-region formats).
 *
 * @returns `"rtl"` if the locale corresponds to a right-to-left writing system,
 * otherwise `"ltr"`.
 */
export function getDirection(locale: string): "rtl" | "ltr" {
  const lang = locale.split("-")[0];
  return RTL_LANGS.has(lang) ? "rtl" : "ltr";
}
