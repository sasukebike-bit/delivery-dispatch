import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";

export default async function DriverDashboard() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const driver = await prisma.driver.findFirst({
    where: { user: { email: session.user.email } },
    include: {
      user: { select: { name: true } },
      orders: {
        where: { status: { in: ["ASSIGNED", "IN_TRANSIT"] } },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!driver) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">ドライバー情報が見つかりません。管理者に連絡してください。</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">こんにちは、{driver.user.name}さん</h2>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">現在のステータス:</span>
          <StatusBadge status={driver.status} type="driver" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">進行中の注文</p>
            <p className="text-3xl font-bold mt-1">{driver.orders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">車両</p>
            <p className="text-sm font-medium mt-1 truncate">{driver.vehicle}</p>
          </CardContent>
        </Card>
      </div>

      {driver.orders.length > 0 && (
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <h3 className="font-semibold text-sm">進行中の注文</h3>
          {driver.orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-2 rounded border">
              <div>
                <p className="text-sm font-medium">{order.title}</p>
                <p className="text-xs text-muted-foreground">{order.deliveryAddress}</p>
              </div>
              <StatusBadge status={order.status} type="order" />
            </div>
          ))}
          <Link href="/driver/orders" className="text-sm text-primary hover:underline block text-center mt-2">
            全ての担当注文を見る →
          </Link>
        </div>
      )}

      {driver.orders.length === 0 && (
        <div className="bg-white rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">現在進行中の注文はありません</p>
          <Link href="/driver/orders" className="text-sm text-primary hover:underline mt-2 block">
            担当注文一覧を見る →
          </Link>
        </div>
      )}
    </div>
  );
}
