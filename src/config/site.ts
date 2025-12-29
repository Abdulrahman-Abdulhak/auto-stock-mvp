import { env } from "@lib/env";

/**
 * Global, user-facing metadata about the site.
 *
 * This configuration is intended for things like:
 * - SEO metadata (title/description)
 * - UI labels (app name)
 * - Canonical/base URL construction
 *
 * Keep values here stable and descriptive; code should *read* from this object rather
 * than duplicating strings throughout the app.
 */
export const siteConfig = {
  /** Human-readable product name shown in UI and metadata. */
  name: "Next.js Template",

  /** Short description used in metadata and landing surfaces. */
  description: "The template for all Next.js projects.",

  /** Public base URL of the site (used for canonical URLs, redirects, etc.). */
  url: env.WEBSITE_URL,
};
