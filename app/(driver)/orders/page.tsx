import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { DriverOrderActions } from "@/components/DriverOrderActions";
import Link from "next/link";

export default async function DriverOrdersPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const driver = await prisma.driver.findFirst({
    where: { user: { email: session.user.email } },
  });

  if (!driver) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">ドライバー情報が見つかりません。</p>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { driverId: driver.id },
    orderBy: { updatedAt: "desc" },
  });

  const active = orders.filter((o) => ["ASSIGNED", "IN_TRANSIT"].includes(o.status));
  const completed = orders.filter((o) => ["DELIVERED", "CANCELLED"].includes(o.status));

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">担当注文一覧</h2>

      <section className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          進行中 ({active.length})
        </h3>
        {active.map((order) => (
          <div key={order.id} className="bg-white rounded-lg border p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <Link href={`/driver/orders/${order.id}`} className="font-medium hover:underline">
                  {order.title}
                </Link>
                <p className="text-sm text-muted-foreground mt-1">集荷: {order.pickupAddress}</p>
                <p className="text-sm text-muted-foreground">配達: {order.deliveryAddress}</p>
                {order.memo && (
                  <p className="text-sm text-amber-700 bg-amber-50 rounded px-2 py-1 mt-2">
                    備考: {order.memo}
                  </p>
                )}
              </div>
              <StatusBadge status={order.status} type="order" />
            </div>
            <DriverOrderActions orderId={order.id} currentStatus={order.status} />
          </div>
        ))}
        {active.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">進行中の注文なし</p>
        )}
      </section>

      {completed.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            完了済 ({completed.length})
          </h3>
          {completed.map((order) => (
            <div key={order.id} className="bg-white rounded-lg border p-4 opacity-70">
              <div className="flex items-start justify-between">
                <div>
                  <Link href={`/driver/orders/${order.id}`} className="font-medium hover:underline">
                    {order.title}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">{order.deliveryAddress}</p>
                </div>
                <StatusBadge status={order.status} type="order" />
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
