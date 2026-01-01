"use client";

import { Button } from "@shadecn";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";

function AddProduct() {
  const t = useTranslations("products.buttons");

  return (
    <Button size="lg">
      <PlusIcon />
      <span className="capitalize">{t("addProduct")}</span>
    </Button>
  );
}

export default AddProduct;
