import { supportedLocales } from "../locale";

/**
 * Union type representing all locales supported by the application.
 *
 * Use this type anywhere you accept or store a locale value to ensure it is one of
 * the officially supported locales (e.g., routing, i18n initialization, user preferences).
 */
export type SupportedLocale = (typeof supportedLocales)[number];
