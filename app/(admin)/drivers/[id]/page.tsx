import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { OrderCard } from "@/components/OrderCard";
import { DriverEditForm } from "@/components/DriverEditForm";
import Link from "next/link";

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const driver = await prisma.driver.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          driver: { include: { user: { select: { id: true, name: true, email: true } } } },
        },
      },
    },
  });

  if (!driver) notFound();

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/drivers" className="text-muted-foreground hover:text-foreground text-sm">
          ← ドライバー一覧
        </Link>
        <h2 className="text-2xl font-bold flex-1">{driver.user.name}</h2>
        <StatusBadge status={driver.status} type="driver" />
      </div>

      {/* Driver info */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">基本情報</h3>
        <div className="grid gap-3">
          <div className="grid grid-cols-3 gap-2">
            <span className="text-sm text-muted-foreground">メール</span>
            <span className="text-sm col-span-2">{driver.user.email}</span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">編集</h3>
        <DriverEditForm driver={driver} />
      </div>

      {/* Orders */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          直近の注文 ({driver.orders.length}件)
        </h3>
        <div className="space-y-2">
          {driver.orders.map((order) => (
            <Link key={order.id} href={`/admin/orders/${order.id}`}>
              <OrderCard order={order} />
            </Link>
          ))}
          {driver.orders.length === 0 && (
            <p className="text-sm text-muted-foreground">注文なし</p>
          )}
        </div>
      </div>
    </div>
  );
}
