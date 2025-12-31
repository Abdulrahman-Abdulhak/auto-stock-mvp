import type { ClassValue } from "clsx";

import Link from "next/link";

import { getTranslations } from "next-intl/server";

import { siteConfig } from "@config/site";
import { cn } from "@lib/cn";

type Props = {
  className?: ClassValue;
};

async function Logo({ className }: Props) {
  const t = await getTranslations(siteConfig.translationRoot);

  return (
    <Link href={"/" as any} className={cn("flex font-bold", className)}>
      {t(siteConfig.name.translated)}
    </Link>
  );
}

export default Logo;
