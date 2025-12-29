import { Icons } from "./constants.gen";

/**
 * Union of all available icon names.
 *
 * This type is derived from the generated icon registry, so it stays in sync
 * with whatever icons are currently available without manual updates.
 */
export type IconName = keyof typeof Icons;
