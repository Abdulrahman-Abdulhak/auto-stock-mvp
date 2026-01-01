import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { Prisma } from "@generated/prisma/client";

function toInt(value: string | null, fallback: number) {
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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const sku = typeof body.sku === "string" ? body.sku.trim() : "";

    const minStockLevel = parseNonNegativeInt(body.minStockLevel);
    const currentStock = parseNonNegativeInt(body.currentStock);

    const errors: Record<string, string> = {};

    if (name.length < 2 || name.length > 120) {
      errors.name = "Name must be between 2 and 120 characters.";
    }

    if (sku.length < 2 || sku.length > 64) {
      errors.sku = "SKU must be between 2 and 64 characters.";
    } else if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(sku)) {
      errors.sku = "SKU contains invalid characters.";
    }

    if (!minStockLevel.ok) {
      errors.minStockLevel = "Min stock level must be a non-negative integer.";
    }

    if (!currentStock.ok) {
      errors.currentStock = "Current stock must be a non-negative integer.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Validation failed", fields: errors },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(
      now.getFullYear() + 10,
      now.getMonth(),
      now.getDate()
    );

    const [product] = await prisma.$transaction([
      prisma.product.create({
        data: {
          name,
          SKU: sku,
          minStockLevel: minStockLevel.value,
        },
        select: {
          id: true,
          name: true,
          SKU: true,
          minStockLevel: true,
          updatedAt: true,
        },
      }),
      ...(currentStock.value > 0
        ? [
            prisma.batch.create({
              data: {
                product: { connect: { SKU: sku } },
                qtyReceived: currentStock.value,
                qtyRemaining: currentStock.value,
                expiresAt,
              },
            }),
          ]
        : []),
    ]);

    return NextResponse.json(
      {
        data: {
          id: product.id,
          name: product.name,
          sku: product.SKU,
          minStockLevel: product.minStockLevel,
          currentStock: currentStock.value,
          updatedAt: product.updatedAt,
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
        { error: "SKU already exists." },
        { status: 409 }
      );
    }

    console.error("POST /api/products failed:", err);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
