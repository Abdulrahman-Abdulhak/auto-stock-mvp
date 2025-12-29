"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

import { themesConfig } from "@config/themes";

type Props = {
  /** Children elements to be rendered within the theme provider */
  children: React.ReactNode;
};

/**
 * Wraps the application with `NextThemesProvider` and configures theme options.
 * Uses `themesConfig` for defaults and available themes.
 *
 * @param props - Component props
 * @returns The configured theme provider rendering `children`
 */
function ThemeProvider({ children }: Props) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={themesConfig.defaultTheme}
      enableSystem={themesConfig.enableSystem}
      disableTransitionOnChange
      themes={[...themesConfig.availableThemes]}
      storageKey={themesConfig.storageKey}
    >
      {children}
    </NextThemesProvider>
  );
}

export default ThemeProvider;
