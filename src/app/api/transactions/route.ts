import { NextResponse } from "next/server";

import { prisma } from "@lib/prisma";

function toInt(value: string | null, fallback: number) {
  if (value == null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const page = Math.max(1, toInt(url.searchParams.get("page"), 1));
    const pageSize = Math.min(
      200,
      Math.max(1, toInt(url.searchParams.get("pageSize"), 20))
    );
    const q = (url.searchParams.get("q") ?? "").trim();

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: Record<string, unknown> = {};

    if (q) {
      where["product"] = {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { SKU: { contains: q, mode: "insensitive" } },
        ],
      };
    }

    const [totalCount, transactions] = await prisma.$transaction([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          type: true,
          qty: true,
          createdAt: true,
          product: {
            select: { id: true, name: true, SKU: true },
          },
          batch: {
            select: { id: true, expiresAt: true },
          },
        },
      }),
    ]);

    const data = transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      qty: tx.qty,
      createdAt: tx.createdAt,
      productId: tx.product.id,
      name: tx.product.name,
      sku: tx.product.SKU,
      batchId: tx.batch?.id ?? null,
      batchExpiresAt: tx.batch?.expiresAt ?? null,
    }));

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return NextResponse.json(
      {
        data,
        pageInfo: {
          page,
          pageSize,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/transactions failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
