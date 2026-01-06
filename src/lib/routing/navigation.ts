import { stripLocalePrefix } from "@i18n/routing";

export function isActivePath(
  currentPathname: string,
  targetPath: string
): boolean {
  const { pathname } = stripLocalePrefix(currentPathname);

  if (pathname === targetPath) return true;
  if (pathname.startsWith(targetPath + "/")) return true;

  return false;
}

export const navLinks = [
  {
    label: "dashboard.label",
    href: "/dashboard",
  },
  {
    label: "products.label",
    href: "/products",
  },
  {
    label: "batches.label",
    href: "/batches",
  },
  {
    label: "transactions.label",
    href: "/transactions",
  },
];
