"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import { isActivePath, navLinks } from "@lib/routing";

import AppContainer from "./AppContainer";

function PageHeader() {
  const linksT = useTranslations("links");
  const pathName = usePathname();

  const activePath = navLinks.find(({ href }) => isActivePath(pathName, href));

  return activePath ? (
    <header className="border-b border-neutral-300 py-4 ">
      <AppContainer>
        <h2 className="text-heading-2 font-bold capitalize">
          {linksT(activePath.label)}
        </h2>
      </AppContainer>
    </header>
  ) : null;
}

export default PageHeader;
