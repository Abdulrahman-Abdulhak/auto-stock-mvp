/**
 * @fileoverview Locale configuration for the application.
 *
 * This module defines which locales (languages) the app supports and which
 * locale should be used as the default/fallback.
 */

import type { SupportedLocale } from "./types";

/**
 * List of locale codes the application supports.
 *
 * Marked `as const` so TypeScript infers a readonly tuple and we can derive a
 * strict `SupportedLocale` union type from it.
 */
export const supportedLocales = ["ar", "en"] as const;

/**
 * The default locale used when:
 * - no locale is specified
 * - the requested locale is not supported
 *
 * Must be one of {@link supportedLocales}.
 */
export const defaultLocale = "en" as const as SupportedLocale;
