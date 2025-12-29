import ThemeBootstrap from "./ThemeBootstrap";

/**
 * Renders application “bootstraps”: lightweight components whose job is to
 * initialize global behavior needed at app startup.
 *
 * Bootstraps typically:
 * - run side effects once on mount,
 * - register global listeners, or
 * - hydrate app-wide configuration.
 *
 * This component keeps those concerns centralized so the root tree stays tidy.
 */
function AppBootstraps() {
  return (
    <>
      <ThemeBootstrap />
    </>
  );
}

export default AppBootstraps;
