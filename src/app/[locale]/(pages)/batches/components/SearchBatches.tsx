"use client";

import { Searchbar } from "@components";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function SearchBatches() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const setSearch = (val: string) => {
    const params = new URLSearchParams(sp.toString());

    if (val == null || val === "") params.delete("q");
    else params.set("q", val);

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : (pathname as any), {
      scroll: false,
    });
  };

  return (
    <Searchbar section="batches" onDebouncedChange={(val) => setSearch(val)} />
  );
}

export default SearchBatches;
