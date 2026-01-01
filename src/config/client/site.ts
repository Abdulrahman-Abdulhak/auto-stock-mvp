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
  translationRoot: "app",

  /** Human-readable product name shown in UI and metadata. */
  name: {
    default: "Auto Stock",
    translated: "name",
  },

  /** Short description used in metadata and landing surfaces. */
  description: {
    default: "Auto Stock",
    translated: "description",
  },
};
