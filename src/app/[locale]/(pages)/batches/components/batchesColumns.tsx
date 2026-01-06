"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@shadecn";

import { BatchRow } from "./types";
import { useTranslations } from "next-intl";

const statusTone: Record<string, "secondary" | "default" | "destructive"> = {
  ACTIVE: "default",
  EXPIRED: "secondary",
  DEPLETED: "destructive",
};

function getExpiryBadge(
  expiresAt: string,
  t: ReturnType<typeof useTranslations>
) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  if (Number.isNaN(expiry.getTime())) return null;

  if (expiry <= now) {
    return { label: t("badges.expired"), variant: "destructive" as const };
  }

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  if (expiry.getTime() - now.getTime() <= sevenDaysMs) {
    return {
      label: t("badges.aboutToExpire"),
      variant: "secondary" as const,
    };
  }

  return null;
}

export function getBatchColumns(
  t: ReturnType<typeof useTranslations>
): ColumnDef<BatchRow>[] {
  return [
    {
      accessorKey: "id",
      header: t("columns.batchId"),
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.getValue("id")}</span>
      ),
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
            {t("labels.updatedAt", {
              date: new Date(row.original.updatedAt).toLocaleString(),
            })}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t("columns.status"),
      cell: ({ row }) => {
        const value = String(row.getValue("status"));
        const variant = statusTone[value] ?? "secondary";
        return (
          <Badge variant={variant} className="uppercase">
            {value}
          </Badge>
        );
      },
    },
    {
      accessorKey: "qtyRemaining",
      header: t("columns.remaining"),
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.getValue("qtyRemaining")}
        </span>
      ),
    },
    {
      accessorKey: "qtyReceived",
      header: t("columns.received"),
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.getValue("qtyReceived")}</span>
      ),
    },
    {
      accessorKey: "expiresAt",
      header: t("columns.expires"),
      cell: ({ row }) => {
        const expiryLabel = getExpiryBadge(row.original.expiresAt, t);
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {new Date(row.original.expiresAt).toLocaleDateString()}
            </span>
            {expiryLabel && (
              <Badge variant={expiryLabel.variant} className="uppercase">
                {expiryLabel.label}
              </Badge>
            )}
          </div>
        );
      },
    },
  ];
}
