import { Card, CardContent, CardHeader, CardTitle } from "@shadecn";

type StatusData = {
  totalProducts: number;
  totalStockCount: number;
  lowStockProductsCount: number;
  expiredItemsCount: number;
};

type StatusProps = {
  data: StatusData;
};

function Status({ data }: StatusProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card className="border-blue-500/40 bg-blue-500/10">
        <CardHeader>
          <CardTitle className="text-blue-700">Total products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold text-blue-700">
            {data.totalProducts.toLocaleString()}
          </div>
        </CardContent>
      </Card>
      <Card className="border-emerald-500/40 bg-emerald-500/10">
        <CardHeader>
          <CardTitle className="text-emerald-700">
            Total stock (base units)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold text-emerald-700">
            {data.totalStockCount.toLocaleString()}
          </div>
        </CardContent>
      </Card>
      <Card className="border-amber-500/50 bg-amber-500/10">
        <CardHeader>
          <CardTitle className="text-amber-700">Low stock products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold text-amber-700">
            {data.lowStockProductsCount.toLocaleString()}
          </div>
        </CardContent>
      </Card>
      <Card className="border-red-500/40 bg-red-500/10">
        <CardHeader>
          <CardTitle className="text-red-700">Expired items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold text-red-700">
            {data.expiredItemsCount.toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Status;
