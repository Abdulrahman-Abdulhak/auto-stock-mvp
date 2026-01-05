"use client";

import type { PaginationState } from "@tanstack/react-table";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { AppTable } from "@components";
import { Searchbar } from "@components";

import { productColumns } from "../../products/components/productsColumns";
import { ProductRow } from "../../products/components/types";
import { batchColumns } from "../../batches/components/batchesColumns";
import { BatchRow } from "../../batches/components/types";
import { useTranslations } from "next-intl";

type FetchedData<T> = {
  data: T[];
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
}): Promise<FetchedData<ProductRow>> {
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

  return (await res.json()) as FetchedData<ProductRow>;
}

async function getBatchesPage(args: {
  page: number;
  pageSize: number;
  productId: number | null;
  signal?: AbortSignal;
}): Promise<FetchedData<BatchRow>> {
  const params = new URLSearchParams();
  params.set("page", String(args.page));
  params.set("pageSize", String(args.pageSize));
  if (args.productId != null) params.set("productId", String(args.productId));

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

  return (await res.json()) as FetchedData<BatchRow>;
}

function DashboardTables() {
  const productsT = useTranslations("products");
  const batchesT = useTranslations("batches");
  const t = useTranslations("dashboard");

  const [search, setSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [productPagination, setProductPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [batchPagination, setBatchPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const productsQuery = useQuery({
    queryKey: [
      "products",
      `products-page-${productPagination.pageIndex}`,
      `products-pagesize-${productPagination.pageSize}`,
      `products-search-${search}`,
    ],
    queryFn: ({ signal }) =>
      getProductsPage({
        page: productPagination.pageIndex + 1,
        pageSize: productPagination.pageSize,
        q: search,
        signal,
      }),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });

  const batchesQuery = useQuery({
    queryKey: [
      "batches",
      `batches-page-${batchPagination.pageIndex}`,
      `batches-pagesize-${batchPagination.pageSize}`,
      `batches-product-${selectedProductId ?? "none"}`,
    ],
    queryFn: ({ signal }) =>
      getBatchesPage({
        page: batchPagination.pageIndex + 1,
        pageSize: batchPagination.pageSize,
        productId: selectedProductId,
        signal,
      }),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });

  const productRows = productsQuery.data?.data ?? [];
  const productPageInfo = productsQuery.data?.pageInfo;

  const batchRows = batchesQuery.data?.data ?? [];
  const batchPageInfo = batchesQuery.data?.pageInfo;

  const selectedProduct = useMemo(() => {
    if (selectedProductId == null) return null;
    return productRows.find((p) => p.id === selectedProductId) ?? null;
  }, [productRows, selectedProductId]);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <header className="flex items-center justify-between py-8 border-b border-neutral-300">
          <h2 className="text-heading-4 font-bold capitalize">
            {productsT("title")}
          </h2>
          <div className="flex">
            <Searchbar
              section="products"
              onDebouncedChange={(val) => {
                setSearch(val);
                setProductPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
            />
          </div>
        </header>
        <AppTable
          columns={productColumns}
          data={productRows}
          pageCount={productPageInfo?.totalPages ?? 1}
          pagination={productPagination}
          onPaginationChange={setProductPagination}
          totalCount={productPageInfo?.totalCount}
          isLoading={productsQuery.isLoading || productsQuery.isFetching}
          onRowClick={(row) => {
            setSelectedProductId(row.id);
            setBatchPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
          getRowClassName={(row) =>
            row.id === selectedProductId ? "bg-muted/60" : ""
          }
        />
      </section>
      <section className="flex flex-col gap-3">
        <header className="flex items-center justify-between py-8 border-b border-neutral-300">
          <h2 className="text-heading-4 font-bold capitalize">
            {batchesT("title")}
          </h2>
          {selectedProduct === null && (
            <p>{t("messages.selectProductToShowTheirBatches")}</p>
          )}
        </header>
        <AppTable
          columns={batchColumns}
          data={batchRows}
          pageCount={batchPageInfo?.totalPages ?? 1}
          pagination={batchPagination}
          onPaginationChange={setBatchPagination}
          totalCount={batchPageInfo?.totalCount}
          isLoading={batchesQuery.isLoading || batchesQuery.isFetching}
        />
      </section>
    </div>
  );
}

export default DashboardTables;
