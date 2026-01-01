"use client";

import type { PaginationState } from "@tanstack/react-table";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ProductRow } from "./types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AppTable } from "@components";
import { productColumns } from "./productsColumns";

type FetchedData = {
  data: ProductRow[];
  pageInfo: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

async function getProductsPage(args: {
  page: number;
  pageSize: number;
  q?: string;
  signal?: AbortSignal;
}): Promise<FetchedData> {
  const params = new URLSearchParams();
  params.set("page", String(args.page));
  params.set("pageSize", String(args.pageSize));
  if (args.q) params.set("q", args.q);

  const res = await fetch(`/api/products?${params.toString()}`, {
    method: "GET",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    signal: args.signal,
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Failed to load products (${res.status}). ${msg}`);
  }

  return (await res.json()) as FetchedData;
}

function clampInt(value: string | null, def: number, min: number, max: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return def;
  const i = Math.trunc(n);
  return Math.min(max, Math.max(min, i));
}

function ProductsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const page = clampInt(sp.get("page"), 1, 1, 1_000_000);
  const pageSize = clampInt(sp.get("pageSize"), 20, 1, 200);
  const qFromUrl = (sp.get("q") ?? "").trim();

  const pagination = { pageIndex: page - 1, pageSize };

  const setParams = (next: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams(sp.toString());

    for (const [key, val] of Object.entries(next)) {
      if (val == null || val === "") params.delete(key);
      else params.set(key, val);
    }

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : (pathname as any), {
      scroll: false,
    });
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: [
      "products",
      `products-page-${page}`,
      `products-pagesize-${pageSize}`,
      `products-qFromUrl-${qFromUrl}`,
    ],
    queryFn: ({ signal }) =>
      getProductsPage({ page, pageSize, signal, q: qFromUrl }),
    staleTime: 30_000, // 30s: avoid refetch spam when navigating back/forth
    gcTime: 5 * 60_000, // cache for 5 minutes
    retry: 1,
  });
  const rows = data?.data ?? [];
  const pageInfo = data?.pageInfo;

  const onPaginationChange = (
    updater: PaginationState | ((old: PaginationState) => PaginationState)
  ) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;

    const nextPage = String(next.pageIndex + 1);
    const nextPageSize = String(next.pageSize);

    const updates: Record<string, string> = {
      page: nextPage,
      pageSize: nextPageSize,
    };

    if (next.pageSize !== pagination.pageSize) {
      updates.page = "1";
    }

    setParams(updates);
  };

  return (
    <AppTable
      columns={productColumns}
      data={rows}
      pageCount={pageInfo?.totalPages ?? 1}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      totalCount={pageInfo?.totalCount}
      isLoading={isLoading || isFetching}
    />
  );
}

export default ProductsTable;
