"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@shadecn";

import { BatchRow } from "./types";

const statusTone: Record<string, "secondary" | "default" | "destructive"> = {
  ACTIVE: "default",
  EXPIRED: "secondary",
  DEPLETED: "destructive",
};

function getExpiryBadge(expiresAt: string) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  if (Number.isNaN(expiry.getTime())) return null;

  if (expiry <= now) {
    return { label: "Expired", variant: "destructive" as const };
  }

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  if (expiry.getTime() - now.getTime() <= sevenDaysMs) {
    return { label: "About to expire", variant: "secondary" as const };
  }

  return null;
}

export const batchColumns: ColumnDef<BatchRow>[] = [
  {
    accessorKey: "id",
    header: "Batch ID",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("id")}</span>
    ),
  },
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
    accessorKey: "status",
    header: "Status",
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
    header: "Remaining",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("qtyRemaining")}</span>
    ),
  },
  {
    accessorKey: "qtyReceived",
    header: "Received",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("qtyReceived")}</span>
    ),
  },
  {
    accessorKey: "expiresAt",
    header: "Expires",
    cell: ({ row }) => {
      const expiryLabel = getExpiryBadge(row.original.expiresAt);
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
