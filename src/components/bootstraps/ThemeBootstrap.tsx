"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

import { getCookie } from "@utils";

/**
 * Bootstrap hook that synchronizes the theme from the `app_theme` cookie
 * into the `next-themes` context on client mount and when the theme changes.
 *
 * It reads the `app_theme` cookie (expected values: "dark", "light", "system")
 * and sets the theme via `setTheme` if it differs from the current theme.
 *
 * @returns This component does not render anything.
 */
function ThemeBootstrap() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const headerTheme = getCookie("app_theme") as
      | "dark"
      | "light"
      | "system"
      | null;

    if (!headerTheme) return;

    if (theme !== headerTheme) setTheme(headerTheme);
  }, [theme]);

  return null;
}

export default ThemeBootstrap;
