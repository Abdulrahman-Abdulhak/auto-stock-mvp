/**
 * Theme behavior and persistence settings for the application UI.
 *
 * This configuration defines:
 * - Which themes are available to users
 * - Whether the OS/browser theme preference is respected
 * - How the selected theme is stored and retrieved
 */
export const themesConfig = {
  /** Theme used when the user has not explicitly chosen one. */
  defaultTheme: "system",

  /** Whether to allow following the system/OS color-scheme preference. */
  enableSystem: true,

  /** List of supported theme identifiers presented to the user. */
  availableThemes: ["light", "dark", "system"],

  /** Storage key used to persist the user's theme selection. */
  storageKey: "theme",
} as const;
