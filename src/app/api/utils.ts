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
