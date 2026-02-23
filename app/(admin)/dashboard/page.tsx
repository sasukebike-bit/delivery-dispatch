import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";

export default async function AdminDashboard() {
  const [orderStats, driverStats, recentOrders] = await Promise.all([
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.driver.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        driver: { include: { user: { select: { name: true } } } },
      },
    }),
  ]);

  const totalOrders = orderStats.reduce((sum, s) => sum + s._count, 0);
  const totalDrivers = driverStats.reduce((sum, s) => sum + s._count, 0);
  const pendingOrders = orderStats.find((s) => s.status === "PENDING")?._count ?? 0;
  const availableDrivers = driverStats.find((s) => s.status === "AVAILABLE")?._count ?? 0;

  const statusLabels: Record<string, string> = {
    PENDING: "未割当",
    ASSIGNED: "割当済",
    IN_TRANSIT: "配送中",
    DELIVERED: "完了",
    CANCELLED: "キャンセル",
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">ダッシュボード</h2>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="注文総数" value={totalOrders} />
        <StatCard title="未割当" value={pendingOrders} highlight />
        <StatCard title="ドライバー総数" value={totalDrivers} />
        <StatCard title="空きドライバー" value={availableDrivers} />
      </div>

      {/* Order status breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">注文ステータス別</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {orderStats.map((s) => (
              <div key={s.status} className="flex justify-between items-center">
                <StatusBadge status={s.status} type="order" />
                <span className="font-semibold">{s._count}</span>
              </div>
            ))}
            {orderStats.length === 0 && (
              <p className="text-sm text-muted-foreground">注文なし</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">最近の注文</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block"
              >
                <div className="flex justify-between items-start hover:bg-gray-50 rounded p-1 -mx-1">
                  <div>
                    <p className="text-sm font-medium">{order.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.driver?.user.name ?? "未割当"}
                    </p>
                  </div>
                  <StatusBadge status={order.status} type="order" />
                </div>
              </Link>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-sm text-muted-foreground">注文なし</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Link
          href="/admin/orders/new"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
        >
          新規注文を作成
        </Link>
        <Link
          href="/admin/drivers"
          className="inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50"
        >
          ドライバー管理
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  highlight,
}: {
  title: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className={`text-3xl font-bold mt-1 ${highlight ? "text-orange-500" : ""}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
