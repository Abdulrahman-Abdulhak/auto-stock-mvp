import type { ClassValue } from "clsx";
import type { IconName } from "./types";

import { cn } from "@lib/cn";

import { Icons } from "./constants.gen";

type Props = {
  /** The registered icon key to render. */
  name: IconName;

  /** Optional classes applied to the underlying SVG element. */
  className?: ClassValue;

  /**
   * Optional Tailwind-compatible text color class.
   * This is kept separate to make “set color” usage explicit at call sites.
   */
  colorClassName?: `text-${string}`;

  /**
   * Optional accessible label for the icon.
   * When provided, the SVG is treated as meaningful content (role="img") and a
   * `<title>` node is injected for assistive technologies.
   */
  title?: string;
};

/**
 * Renders an SVG icon from the app’s icon registry.
 *
 * - The icon is selected by `name` (a key from the generated icon map).
 * - `className` / `colorClassName` let callers size and style the SVG.
 * - Providing `title` makes the icon accessible as a labeled image; omitting it
 *   treats the icon as decorative.
 */
function AppIcon({ name, className, colorClassName, title }: Props) {
  const Svg = Icons[name] ?? Icons["placeholder"];

  return (
    <Svg
      className={cn("block", className, colorClassName)}
      aria-hidden={!!title}
      role={title ? "img" : "presentation"}
    >
      {title ? <title>{title}</title> : null}
    </Svg>
  );
}

export default AppIcon;
