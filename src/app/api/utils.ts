import type { Prisma } from "@generated/prisma/client";
import { PrismaClient } from "@generated/prisma/client";
import { prisma } from "@lib/prisma";

export async function calculateTotalStock(productID: number) {
  const batches = await prisma.batch.findMany({
    where: { productId: productID },
    select: {
      qtyRemaining: true,
      unit: {
        select: {
          conversionToBase: true,
        },
      },
    },
  });

  return batches.reduce((total, batch) => {
    const multiplier = batch.unit?.conversionToBase ?? 1;
    return total + batch.qtyRemaining * multiplier;
  }, 0);
}

export async function getDefaultUserId(
  client: Prisma.TransactionClient | PrismaClient = prisma
) {
  const user = await client.user.findFirst({
    select: { id: true },
    orderBy: { id: "asc" },
  });

  if (!user) {
    throw new Error("No users available for transaction records.");
  }

  return user.id;
}
