"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@shadecn";

import { TransactionRow } from "./types";
import { useTranslations } from "next-intl";

const typeTone: Record<string, "secondary" | "default" | "destructive"> = {
  IN: "default",
  OUT: "destructive",
  ADJUST: "secondary",
};

export function getTransactionColumns(
  t: ReturnType<typeof useTranslations>
): ColumnDef<TransactionRow>[] {
  return [
    {
      accessorKey: "type",
      header: t("columns.type"),
      cell: ({ row }) => {
        const value = String(row.getValue("type"));
        const variant = typeTone[value] ?? "secondary";
        return (
          <Badge variant={variant} className="uppercase">
            {value}
          </Badge>
        );
      },
    },
    {
      accessorKey: "sku",
      header: t("columns.sku"),
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.getValue("sku")}</span>
      ),
    },
    {
      accessorKey: "name",
      header: t("columns.product"),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("name")}</span>
          <span className="text-xs text-muted-foreground">
            {t("labels.createdAt", {
              date: new Date(row.original.createdAt).toLocaleString(),
            })}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "qty",
      header: t("columns.qty"),
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.getValue("qty")}</span>
      ),
    },
    {
      accessorKey: "batchId",
      header: t("columns.batch"),
      cell: ({ row }) => {
        const batchId = row.original.batchId;
        const expiry = row.original.batchExpiresAt;
        return (
          <div className="flex flex-col">
            <span className="font-mono text-sm">
              {batchId == null ? "—" : batchId}
            </span>
            <span className="text-xs text-muted-foreground">
              {expiry
                ? new Date(expiry).toLocaleDateString()
                : t("labels.noExpiry")}
            </span>
          </div>
        );
      },
    },
  ];
}
