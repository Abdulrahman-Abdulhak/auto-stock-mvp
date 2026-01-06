"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@shadecn";

import { ProductRow } from "./types";

function stockTone(current: number, min: number) {
  if (current <= 0) return "destructive";
  if (current < min) return "secondary";
  return "default";
}

function statusTone(current: number, min: number) {
  if (current < min) return "destructive";
  return "default";
}

export const productColumns: ColumnDef<ProductRow>[] = [
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("sku")}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.getValue("name")}</span>
        <span className="text-xs text-muted-foreground">
          Updated {new Date(row.original.updatedAt).toLocaleString()}
        </span>
      </div>
    ),
  },
  {
    id: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const { currentStock, minStockLevel } = row.original;
      const variant = stockTone(currentStock, minStockLevel);
      const statusVariant = statusTone(currentStock, minStockLevel);
      const statusLabel = currentStock < minStockLevel ? "Low Stock" : null;

      return (
        <div className="flex items-center gap-2">
          <Badge variant={variant as any}>{currentStock}</Badge>
          <span className="text-xs text-muted-foreground">
            min {minStockLevel}
          </span>
          {statusLabel && (
            <Badge variant={statusVariant as any} className="uppercase">
              {statusLabel}
            </Badge>
          )}
        </div>
      );
    },
  },
];
