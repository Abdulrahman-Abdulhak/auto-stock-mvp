import { headers } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";

import { DashboardTables, Status } from "./components";

type DashboardData = {
  totalProducts: number;
  totalStockCount: number;
  lowStockProductsCount: number;
  expiredItemsCount: number;
};

export default async function DashboardPage() {
  noStore();
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const baseUrl = host ? `${proto}://${host}` : "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/dashboard`, { cache: "no-store" });
  const payload = res.ok ? await res.json() : null;
  const data: DashboardData = payload?.data ?? {
    totalProducts: 0,
    totalStockCount: 0,
    lowStockProductsCount: 0,
    expiredItemsCount: 0,
  };

  return (
    <div className="grid gap-8 py-4">
      <Status data={data} />
      <DashboardTables />
    </div>
  );
}
