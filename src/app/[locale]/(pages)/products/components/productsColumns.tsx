"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@shadecn";

import { ProductRow } from "./types";
import { useTranslations } from "next-intl";

function stockTone(current: number, min: number) {
  if (current <= 0) return "destructive";
  if (current < min) return "secondary";
  return "default";
}

function statusTone(current: number, min: number) {
  if (current < min) return "destructive";
  return "default";
}

export function getProductColumns(
  t: ReturnType<typeof useTranslations>
): ColumnDef<ProductRow>[] {
  return [
    {
      accessorKey: "sku",
      header: t("columns.sku"),
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.getValue("sku")}</span>
      ),
    },
    {
      accessorKey: "name",
      header: t("columns.name"),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("name")}</span>
          <span className="text-xs text-muted-foreground">
            {t("labels.updatedAt", {
              date: new Date(row.original.updatedAt).toLocaleString(),
            })}
          </span>
        </div>
      ),
    },
    {
      id: "stock",
      header: t("columns.stock"),
      cell: ({ row }) => {
        const { currentStock, minStockLevel } = row.original;
        const variant = stockTone(currentStock, minStockLevel);
        const statusVariant = statusTone(currentStock, minStockLevel);
        const statusLabel =
          currentStock < minStockLevel ? t("badges.lowStock") : null;

        return (
          <div className="flex items-center gap-2">
            <Badge variant={variant as any}>{currentStock}</Badge>
            <span className="text-xs text-muted-foreground">
              {t("labels.minStock", { min: minStockLevel })}
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
}
