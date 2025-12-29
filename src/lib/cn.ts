import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Tailwind merge customization used to extend class group resolution.
 * This file centralizes `clsx` + `tailwind-merge` composition so callers
 * can pass arbitrary class values and have sensible merging behavior.
 */
// TODO: Add auto-generator to this file
const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // Tell tailwind-merge these are font-size utilities so they are treated
      // as a single group and merged correctly when multiple variants are present.
      "font-size": [
        "text-display-1",
        "text-display-2",
        "text-heading-1",
        "text-heading-2",
        "text-heading-3",
        "text-heading-4",
        "text-heading-5",
        "text-heading-6",
        "text-sub-heading",
        "text-paragraph-1",
        "text-paragraph-2",
        "text-paragraph-3",
        "text-caption",
        "text-footer",
      ],
    },
  },
});

/**
 * Combines classname inputs using `clsx` then applies `tailwind-merge`
 * to resolve conflicting Tailwind utility classes.
 *
 * @param inputs - Class values (strings, arrays, objects) accepted by `clsx`
 * @returns A merged className string safe for use on elements
 */
export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
