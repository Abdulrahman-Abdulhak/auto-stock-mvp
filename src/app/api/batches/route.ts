import { NextResponse } from "next/server";

import { Prisma, BatchStatusType, TransactionType } from "@generated/prisma/client";
import { prisma } from "@lib/prisma";
import { getDefaultUserId } from "@app/api/utils";

function toInt(value: string | null, fallback: number) {
  if (value == null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function parseNonNegativeInt(value: unknown) {
  if (value == null || value === "") {
    return { ok: true, value: 0 };
  }

  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
    return { ok: false, value: 0 };
  }

  return { ok: true, value: n };
}

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

function parseRequiredDate(value: unknown) {
  if (value == null || value === "") {
    return { ok: false, value: null as Date | null };
  }
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) {
    return { ok: false, value: null as Date | null };
  }
  return { ok: true, value: d };
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
    const productIdParam = url.searchParams.get("productId");
    const productId =
      productIdParam == null || productIdParam === ""
        ? null
        : toInt(productIdParam, -1);

    if (productId != null && productId <= 0) {
      return NextResponse.json(
        { error: "Invalid productId filter." },
        { status: 400 }
      );
    }

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

    if (productId) {
      where.productId = productId;
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
    const unitId = parsePositiveInt(body.unitId);
    const qtyReceived = parseNonNegativeInt(body.qtyReceived);
    const expiresAt = parseRequiredDate(body.expiresAt);

    const errors: Record<string, string> = {};

    if (!productId.ok) {
      errors.productId = "Product is required.";
    }

    if (!unitId.ok) {
      errors.unitId = "Unit is required.";
    }

    if (!qtyReceived.ok) {
      errors.qtyReceived =
        "Initial received quantity must be a non-negative integer.";
    }

    if (!expiresAt.ok) {
      errors.expiresAt = "Expiration date is required.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Validation failed", fields: errors },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const [product, unit] = await Promise.all([
        tx.product.findUnique({
          where: { id: productId.value },
          select: { id: true, name: true, SKU: true },
        }),
        tx.unit.findUnique({
          where: { id: unitId.value },
          select: { id: true },
        }),
      ]);

      if (!product) {
        return { type: "product_missing" as const };
      }

      if (!unit) {
        return { type: "unit_missing" as const };
      }

      const createdById = await getDefaultUserId(tx);
      const batch = await tx.batch.create({
        data: {
          productId: product.id,
          unitId: unit.id,
          qtyReceived: qtyReceived.value,
          qtyRemaining: qtyReceived.value,
          status: BatchStatusType.ACTIVE,
          expiresAt: expiresAt.value!,
        },
        select: {
          id: true,
          status: true,
          qtyReceived: true,
          qtyRemaining: true,
          expiresAt: true,
          updatedAt: true,
          product: {
            select: {
              id: true,
              name: true,
              SKU: true,
            },
          },
        },
      });

      await tx.transaction.create({
        data: {
          type: TransactionType.IN,
          productId: product.id,
          batchId: batch.id,
          qty: qtyReceived.value,
          createdById,
        },
      });

      return { type: "ok" as const, batch };
    });

    if (result.type === "product_missing") {
      return NextResponse.json(
        {
          error: "Product not found.",
          fields: { productId: "Product not found." },
        },
        { status: 404 }
      );
    }

    if (result.type === "unit_missing") {
      return NextResponse.json(
        { error: "Unit not found.", fields: { unitId: "Unit not found." } },
        { status: 404 }
      );
    }

    const batch = result.batch;

    return NextResponse.json(
      {
        data: {
          id: batch.id,
          productId: batch.product.id,
          name: batch.product.name,
          sku: batch.product.SKU,
          status: batch.status,
          qtyReceived: batch.qtyReceived,
          qtyRemaining: batch.qtyRemaining,
          expiresAt: batch.expiresAt,
          updatedAt: batch.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Batch already exists." },
        { status: 409 }
      );
    }

    console.error("POST /api/batches failed:", err);
    return NextResponse.json(
      { error: "Failed to create batch" },
      { status: 500 }
    );
  }
}
