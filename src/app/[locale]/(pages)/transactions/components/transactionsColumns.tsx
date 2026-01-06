"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@shadecn";

import { TransactionRow } from "./types";

const typeTone: Record<string, "secondary" | "default" | "destructive"> = {
  IN: "default",
  OUT: "destructive",
  ADJUST: "secondary",
};

export const transactionColumns: ColumnDef<TransactionRow>[] = [
  {
    accessorKey: "type",
    header: "Type",
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
          {new Date(row.original.createdAt).toLocaleString()}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "qty",
    header: "Qty",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("qty")}</span>
    ),
  },
  {
    accessorKey: "batchId",
    header: "Batch",
    cell: ({ row }) => {
      const batchId = row.original.batchId;
      const expiry = row.original.batchExpiresAt;
      return (
        <div className="flex flex-col">
          <span className="font-mono text-sm">
            {batchId == null ? "—" : batchId}
          </span>
          <span className="text-xs text-muted-foreground">
            {expiry ? new Date(expiry).toLocaleDateString() : "No expiry"}
          </span>
        </div>
      );
    },
  },
];
