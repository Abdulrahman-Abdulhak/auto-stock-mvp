import { NextResponse } from "next/server";

import { Prisma, BatchStatusType } from "@generated/prisma/client";
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
    const statusParam = (url.searchParams.get("status") ?? "")
      .trim()
      .toUpperCase();
    const status = statusParam ? (statusParam as BatchStatusType) : undefined;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.BatchWhereInput = {};

    if (q) {
      where.product = {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { SKU: { contains: q, mode: "insensitive" } },
        ],
      };
    }

    if (status) {
      if (!Object.values(BatchStatusType).includes(status)) {
        return NextResponse.json(
          { error: "Invalid status filter." },
          { status: 400 }
        );
      }
      where.status = status;
    }

    const [totalCount, batches] = await prisma.$transaction([
      prisma.batch.count({ where }),
      prisma.batch.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          expiresAt: true,
          product: {
            select: {
              id: true,
              name: true,
              SKU: true,
            },
          },
          status: true,
          qtyReceived: true,
          qtyRemaining: true,
          updatedAt: true,
        },
      }),
    ]);

    const data = batches.map((batch) => {
      return {
        id: batch.id,
        productId: batch.product.id,
        name: batch.product.name,
        sku: batch.product.SKU,
        status: batch.status,
        qtyReceived: batch.qtyReceived,
        qtyRemaining: batch.qtyRemaining,
        expiresAt: batch.expiresAt,
        updatedAt: batch.updatedAt,
      };
    });

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
    console.error(err);
    console.error("GET /api/batches failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch batches" },
      { status: 500 }
    );
  }
}
