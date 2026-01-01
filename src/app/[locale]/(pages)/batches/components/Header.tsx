import { getTranslations } from "next-intl/server";

import SearchBatches from "./SearchBatches";
import AddBatch from "./AddBatch";

async function Header() {
  const t = await getTranslations("batches");

  return (
    <header className="flex items-center justify-between py-8 border-b border-neutral-300">
      <div>
        <h1 className="text-heading-1 font-bold capitalize">{t("title")}</h1>
        <p className="text-paragraph-1">{t("description")}</p>
      </div>
      <div className="flex gap-2">
        <SearchBatches />
        <AddBatch />
      </div>
    </header>
  );
}

export default Header;
