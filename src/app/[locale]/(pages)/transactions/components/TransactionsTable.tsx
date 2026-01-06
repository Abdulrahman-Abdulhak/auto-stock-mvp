"use client";

import type { PaginationState } from "@tanstack/react-table";

import { useQuery } from "@tanstack/react-query";

import { TransactionRow } from "./types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AppTable } from "@components";
import { transactionColumns } from "./transactionsColumns";

type FetchedData = {
  data: TransactionRow[];
  pageInfo: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

async function getTransactionsPage(args: {
  page: number;
  pageSize: number;
  q?: string;
  signal?: AbortSignal;
}): Promise<FetchedData> {
  const params = new URLSearchParams();
  params.set("page", String(args.page));
  params.set("pageSize", String(args.pageSize));
  if (args.q) params.set("q", args.q);

  const res = await fetch(`/api/transactions?${params.toString()}`, {
    method: "GET",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    signal: args.signal,
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Failed to load transactions (${res.status}). ${msg}`);
  }

  return (await res.json()) as FetchedData;
}

function clampInt(value: string | null, def: number, min: number, max: number) {
  if (value == null || value === "") return def;
  const n = Number(value);
  if (!Number.isFinite(n)) return def;
  const i = Math.trunc(n);
  return Math.min(max, Math.max(min, i));
}

function TransactionsTable() {
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

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "transactions",
      `transactions-page-${page}`,
      `transactions-pagesize-${pageSize}`,
      `transactions-search-${qFromUrl}`,
    ],
    queryFn: ({ signal }) =>
      getTransactionsPage({ page, pageSize, signal, q: qFromUrl }),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
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
      columns={transactionColumns}
      data={rows}
      pageCount={pageInfo?.totalPages ?? 1}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      totalCount={pageInfo?.totalCount}
      isLoading={isLoading || isFetching}
    />
  );
}

export default TransactionsTable;
