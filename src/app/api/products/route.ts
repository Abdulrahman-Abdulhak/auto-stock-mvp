import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";

function toInt(value: string | null, fallback: number) {
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
      where["OR"] = [
        { name: { contains: q, mode: "insensitive" } },
        { SKU: { contains: q, mode: "insensitive" } },
      ];
    }

    const [totalCount, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          name: true,
          SKU: true,
          minStockLevel: true,
          batches: true,
          updatedAt: true,
        },
      }),
    ]);

    const ids = products.map((p) => p.id);

    const stockSums = !ids.length
      ? []
      : await prisma.batch.groupBy({
          by: "productId",
          where: { productId: { in: ids } },
          _sum: { qtyRemaining: true },
        });

    const stockByProduct = new Map(
      stockSums.map((s) => [s.productId, s._sum.qtyRemaining ?? 0])
    );

    const data = products.map((p) => {
      return {
        id: p.id,
        name: p.name,
        sku: p.SKU,
        minStockLevel: p.minStockLevel,
        currentStock: stockByProduct.get(p.id) ?? 0,
        updatedAt: p.updatedAt,
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
    console.error("GET /api/products failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
