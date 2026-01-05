import { NextResponse } from "next/server";

import { BatchStatusType, Prisma } from "@generated/prisma/client";
import { prisma } from "@lib/prisma";

function parsePositiveInt(value: unknown) {
  if (value == null || value === "") {
    return { ok: false, value: 0 };
  }

  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    return { ok: false, value: 0 };
  }

  return { ok: true, value: n };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const productId = parsePositiveInt(body.productId);
    const qtyToSell = parsePositiveInt(body.qtyToSell);

    const errors: Record<string, string> = {};

    if (!productId.ok) {
      errors.productId = "Product is required.";
    }

    if (!qtyToSell.ok) {
      errors.qtyToSell = "Amount to sell must be a positive integer.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Validation failed", fields: errors },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: productId.value },
          select: { id: true },
        });

        if (!product) {
          return { type: "not_found" as const };
        }

        const now = new Date();
        const batches = await tx.batch.findMany({
          where: {
            productId: product.id,
            status: BatchStatusType.ACTIVE,
            expiresAt: { gte: now },
            qtyRemaining: { gt: 0 },
          },
          orderBy: { expiresAt: "asc" },
          select: {
            id: true,
            expiresAt: true,
            qtyRemaining: true,
            qtyReceived: true,
            unitId: true,
            unit: {
              select: {
                id: true,
                baseUnitId: true,
                conversionToBase: true,
              },
            },
          },
        });

        if (!batches.length) {
          return { type: "no_batches" as const };
        }

        let remaining = qtyToSell.value;
        const allocations: {
          batchId: number;
          expiresAt: Date;
          qtyInBase: number;
        }[] = [];

        const updates: {
          id: number;
          unitId: number | null;
          qtyRemaining: number;
          qtyReceived: number;
          expectedUnitId: number | null;
          expectedQtyRemaining: number;
        }[] = [];

        for (const batch of batches) {
          if (remaining <= 0) break;
          const conversion = batch.unit?.conversionToBase ?? 1;
          const availableBase = batch.qtyRemaining * conversion;
          if (availableBase <= 0) continue;

          const take = Math.min(availableBase, remaining);
          remaining -= take;

          const baseUnitId =
            batch.unit?.baseUnitId ?? batch.unit?.id ?? batch.unitId ?? null;

          if (batch.unit && !baseUnitId) {
            return { type: "missing_base_unit" as const };
          }

          const newRemainingBase = availableBase - take;
          const newReceivedBase = batch.qtyReceived * conversion;

          updates.push({
            id: batch.id,
            unitId: baseUnitId,
            qtyRemaining: newRemainingBase,
            qtyReceived: newReceivedBase,
            expectedUnitId: batch.unitId,
            expectedQtyRemaining: batch.qtyRemaining,
          });

          allocations.push({
            batchId: batch.id,
            expiresAt: batch.expiresAt,
            qtyInBase: take,
          });
        }

        if (remaining > 0) {
          return { type: "insufficient" as const };
        }

        for (const update of updates) {
          const res = await tx.batch.updateMany({
            where: {
              id: update.id,
              unitId: update.expectedUnitId,
              qtyRemaining: update.expectedQtyRemaining,
            },
            data: {
              unitId: update.unitId,
              qtyRemaining: update.qtyRemaining,
              qtyReceived: update.qtyReceived,
            },
          });

          if (res.count !== 1) {
            return { type: "conflict" as const };
          }
        }

        return { type: "ok" as const, allocations };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    if (result.type === "not_found") {
      return NextResponse.json(
        {
          error: "Product not found.",
          fields: { productId: "Product not found." },
        },
        { status: 404 }
      );
    }

    if (result.type === "missing_base_unit") {
      return NextResponse.json(
        { error: "Batch unit is missing a base unit mapping." },
        { status: 500 }
      );
    }

    if (result.type === "no_batches") {
      return NextResponse.json(
        { error: "No non-expired batches available for this product." },
        { status: 409 }
      );
    }

    if (result.type === "insufficient") {
      return NextResponse.json(
        { error: "Insufficient non-expired stock to fulfill the sale." },
        { status: 409 }
      );
    }

    if (result.type === "conflict") {
      return NextResponse.json(
        { error: "Stock changed, please retry the sale." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        data: {
          allocations: result.allocations.map((allocation) => ({
            batchId: allocation.batchId,
            expiresAt: allocation.expiresAt,
            qtyInBase: allocation.qtyInBase,
          })),
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/products/sell failed:", err);
    return NextResponse.json(
      { error: "Failed to sell product" },
      { status: 500 }
    );
  }
}
