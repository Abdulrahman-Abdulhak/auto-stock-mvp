import { getTranslations } from "next-intl/server";

import SearchProducts from "./SearchProducts";
import AddProduct from "./AddProduct";

async function Header() {
  const t = await getTranslations("products");

  return (
    <header className="flex items-center justify-between py-8 border-b border-neutral-300">
      <h1 className="text-heading-1 font-bold capitalize">{t("title")}</h1>
      <div className="flex gap-2">
        <SearchProducts />
        <AddProduct />
      </div>
    </header>
  );
}

export default Header;
