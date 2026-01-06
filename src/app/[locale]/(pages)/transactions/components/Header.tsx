import { getTranslations } from "next-intl/server";

import SearchTransactions from "./SearchTransactions";

async function Header() {
  const t = await getTranslations("transactions");

  return (
    <header className="flex items-center justify-between py-8 border-b border-neutral-300">
      <h1 className="text-heading-1 font-bold capitalize">{t("title")}</h1>
      <div className="flex gap-2">
        <SearchTransactions />
      </div>
    </header>
  );
}

export default Header;
