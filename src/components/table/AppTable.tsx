"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
} from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shadecn";
import { getDirection } from "@i18n/direction";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  // Server pagination
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((old: PaginationState) => PaginationState)
  ) => void;

  totalCount?: number;
  isLoading?: boolean;
};

function AppTable<TData, TValue>({
  columns,
  data,
  onPaginationChange,
  pageCount,
  pagination,
  isLoading,
  totalCount,
}: DataTableProps<TData, TValue>) {
  const paginationT = useTranslations("pagination");
  const productsT = useTranslations("products");

  const locale = useLocale();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: { pagination },
    onPaginationChange,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const currentPage = pagination.pageIndex + 1;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <footer className="flex justify-between items-center p-2">
        <p>
          {paginationT("labeledShowingXofN", {
            x: pagination.pageSize,
            n: totalCount ?? 1,
            label: productsT("title"),
          })}
        </p>
        <div className="flex items-center gap-2">
          <p>
            {paginationT("pageXofN", {
              x: currentPage,
              n: pageCount,
            })}
          </p>
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {getDirection(locale) === "ltr" ? (
                <ChevronLeft />
              ) : (
                <ChevronRight />
              )}
            </Button>
            <div className="">{currentPage}</div>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {getDirection(locale) === "ltr" ? (
                <ChevronRight />
              ) : (
                <ChevronLeft />
              )}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AppTable;
