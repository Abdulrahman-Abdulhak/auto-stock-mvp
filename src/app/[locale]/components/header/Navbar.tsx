"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";

import { isActivePath } from "@lib/routing";
import { cn } from "@lib/cn";

type Props = {
  links: {
    label: string;
    href: string;
  }[];
};

function Navbar({ links }: Props) {
  const t = useTranslations("links");
  const pathname = usePathname();

  const isActive = (href: string) => isActivePath(pathname, href);

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {links.map(({ href, label }) => (
          <NavigationMenuItem key={href}>
            <NavigationMenuLink
              href={href}
              active={isActive(href)}
              className={cn("capitalize px-4 py-3 text-heading-6", {
                underline: isActive(href),
              })}
            >
              {t(label)}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export default Navbar;
