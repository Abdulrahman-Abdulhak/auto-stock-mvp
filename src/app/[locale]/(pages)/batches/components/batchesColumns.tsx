"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@shadecn";

import { BatchRow } from "./types";

const statusTone: Record<string, "secondary" | "default" | "destructive"> = {
  ACTIVE: "default",
  EXPIRED: "secondary",
  DEPLETED: "destructive",
};

export const batchColumns: ColumnDef<BatchRow>[] = [
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
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {new Date(row.original.expiresAt).toLocaleDateString()}
      </span>
    ),
  },
];
