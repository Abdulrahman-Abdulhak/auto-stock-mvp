"use client";

import type { PaginationState } from "@tanstack/react-table";

import { useQuery } from "@tanstack/react-query";

import { BatchRow } from "./types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AppTable } from "@components";
import { batchColumns } from "./batchesColumns";

type FetchedData = {
  data: BatchRow[];
  pageInfo: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

async function getBatchesPage(args: {
  page: number;
  pageSize: number;
  q?: string;
  status?: string;
  signal?: AbortSignal;
}): Promise<FetchedData> {
  const params = new URLSearchParams();
  params.set("page", String(args.page));
  params.set("pageSize", String(args.pageSize));
  if (args.q) params.set("q", args.q);
  if (args.status) params.set("status", args.status);

  const res = await fetch(`/api/batches?${params.toString()}`, {
    method: "GET",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    signal: args.signal,
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Failed to load batches (${res.status}). ${msg}`);
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

function BatchesTable() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const page = clampInt(sp.get("page"), 1, 1, 1_000_000);
  const pageSize = clampInt(sp.get("pageSize"), 20, 1, 200);
  const qFromUrl = (sp.get("q") ?? "").trim();
  const statusFromUrl = (sp.get("status") ?? "").trim();

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
      "batches",
      `batches-page-${page}`,
      `batches-pagesize-${pageSize}`,
      `batches-qFromUrl-${qFromUrl}`,
      `batches-statusFromUrl-${statusFromUrl}`,
    ],
    queryFn: ({ signal }) =>
      getBatchesPage({
        page,
        pageSize,
        signal,
        q: qFromUrl,
        status: statusFromUrl,
      }),
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
      columns={batchColumns}
      data={rows}
      pageCount={pageInfo?.totalPages ?? 1}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      totalCount={pageInfo?.totalCount}
      isLoading={isLoading || isFetching}
    />
  );
}

export default BatchesTable;
