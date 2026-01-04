import { NextResponse } from "next/server";

import { prisma } from "@lib/prisma";

export async function GET() {
  try {
    const units = await prisma.unit.findMany({
      orderBy: { code: "asc" },
      select: {
        id: true,
        code: true,
      },
    });

    return NextResponse.json({ data: units }, { status: 200 });
  } catch (err) {
    console.error("GET /api/units failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch units" },
      { status: 500 }
    );
  }
}
