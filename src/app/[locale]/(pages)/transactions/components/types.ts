export type TransactionRow = {
  id: number;
  type: string;
  qty: number;
  createdAt: string;
  productId: number;
  name: string;
  sku: string;
  batchId: number | null;
  batchExpiresAt: string | null;
};
