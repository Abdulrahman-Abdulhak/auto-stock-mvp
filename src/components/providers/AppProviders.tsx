import ThemeProvider from "./ThemeProvider";
import QueryProvider from "./QueryProvider";
import InternationalizationProvider from "./InternationalizationProvider";

type Props = { children: React.ReactNode };

/**
 * Composes the application’s top-level context providers.
 *
 * The intent is to give every screen a consistent “app environment” (shared
 * configuration, global state, cross-cutting services, etc.) without making
 * individual pages responsible for wiring those concerns.
 *
 * Notes:
 * - The specific set and order of providers may change as the app evolves.
 * - Consumers should rely on the exported contexts/hooks, not on the provider
 *   composition details.
 */
function AppProviders({ children }: Props) {
  return (
    <InternationalizationProvider>
      <QueryProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryProvider>
    </InternationalizationProvider>
  );
}

export default AppProviders;
