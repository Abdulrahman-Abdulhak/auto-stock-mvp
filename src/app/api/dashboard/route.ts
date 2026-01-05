import { NextResponse } from "next/server";

import { BatchStatusType } from "@generated/prisma/client";
import { prisma } from "@lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    const [totalProducts, expiredItemsCount, batches, products] =
      await prisma.$transaction([
        prisma.product.count(),
        prisma.batch.count({
          where: {
            OR: [
              { status: BatchStatusType.EXPIRED },
              { expiresAt: { lt: now } },
            ],
          },
        }),
        prisma.batch.findMany({
          select: {
            productId: true,
            qtyRemaining: true,
            unit: { select: { conversionToBase: true } },
          },
        }),
        prisma.product.findMany({
          select: {
            id: true,
            minStockLevel: true,
          },
        }),
      ]);

    const stockByProduct = new Map<number, number>();
    let totalStockCount = 0;

    for (const batch of batches) {
      const multiplier = batch.unit?.conversionToBase ?? 1;
      const baseQty = batch.qtyRemaining * multiplier;
      totalStockCount += baseQty;
      stockByProduct.set(
        batch.productId,
        (stockByProduct.get(batch.productId) ?? 0) + baseQty
      );
    }

    let lowStockProductsCount = 0;
    for (const product of products) {
      if (product.minStockLevel == null) continue;
      const total = stockByProduct.get(product.id) ?? 0;
      if (total < product.minStockLevel) {
        lowStockProductsCount += 1;
      }
    }

    return NextResponse.json(
      {
        data: {
          totalProducts,
          totalStockCount,
          lowStockProductsCount,
          expiredItemsCount,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/dashboard failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
