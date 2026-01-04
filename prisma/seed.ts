import {
  UnitType,
  BatchStatusType,
  TransactionType,
} from "../src/generated/prisma/enums";

import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  // Units
  const piece = await prisma.unit.upsert({
    where: { code: "piece" },
    update: { baseUnitId: null, conversionToBase: 1 },
    create: {
      code: "piece",
      type: UnitType.BASE,
      baseUnitId: null,
      conversionToBase: 1,
    },
  });

  const carton = await prisma.unit.upsert({
    where: { code: "carton" },
    update: {
      baseUnitId: piece.id,
      conversionToBase: 24,
    },
    create: {
      code: "carton",
      type: UnitType.PACKAGE,
      baseUnitId: piece.id,
      conversionToBase: 24,
    },
  });

  // User
  const admin = await prisma.user.upsert({
    where: { email: "admin@local.test" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@local.test",
      password: "CHANGE_ME_HASH",
    },
  });

  // Product
  const product = await prisma.product.upsert({
    where: { SKU: "PEPSI-330" },
    update: {},
    create: {
      SKU: "PEPSI-330",
      name: "Pepsi 330ml",
      minStockLevel: 24,
      // REMOVE unitId or replace with baseUnitId if you model it properly
    },
  });

  // Batch
  const batch = await prisma.batch.create({
    data: {
      productId: product.id,
      unitId: piece.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60), // ~60 days
      qtyReceived: 24,
      qtyRemaining: 24,
      status: BatchStatusType.ACTIVE,
    },
  });

  // Transaction (stock in)
  await prisma.transaction.create({
    data: {
      type: TransactionType.IN,
      productId: product.id,
      batchId: batch.id,
      qty: 24,
      createdById: admin.id,
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
