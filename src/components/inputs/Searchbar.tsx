"use client";

import "@lib/built-ins";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Field, Input } from "@shadecn";
import { useDebouncedCallback } from "@hooks";

type Props = {
  section: string;

  onDebouncedChange?: (value: string) => void;
  debounceMs?: number;
};

function Searchbar({ section, onDebouncedChange, debounceMs = 700 }: Props) {
  const t = useTranslations("form.search");

  const [internal, setInternal] = useState("");

  const debounced = useDebouncedCallback(onDebouncedChange, debounceMs);

  const setValue = (next: string) => {
    setInternal(next);
    debounced?.(next);
  };

  return (
    <Field>
      <Input
        type="search"
        placeholder={t(`placeholders.${section}`).capitalizeSentence()}
        className="placeholder:first-letter:capitalize"
        onChange={(e) => setValue(e.target.value)}
        value={internal}
      />
    </Field>
  );
}

export default Searchbar;
