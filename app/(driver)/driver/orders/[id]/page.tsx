import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { DriverOrderActions } from "@/components/DriverOrderActions";
import Link from "next/link";

export default async function DriverOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const { id } = await params;

  const driver = await prisma.driver.findFirst({
    where: { user: { email: session.user.email } },
  });

  if (!driver) redirect("/driver/dashboard");

  const order = await prisma.order.findUnique({ where: { id } });

  if (!order || order.driverId !== driver.id) notFound();

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/driver/orders" className="text-muted-foreground hover:text-foreground text-sm">
          ← 担当注文一覧
        </Link>
        <h2 className="text-2xl font-bold flex-1">{order.title}</h2>
        <StatusBadge status={order.status} type="order" />
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">配送情報</h3>
        <div className="grid gap-3">
          <div className="grid grid-cols-3 gap-2">
            <span className="text-sm text-muted-foreground">集荷先</span>
            <span className="text-sm col-span-2">{order.pickupAddress}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-sm text-muted-foreground">配達先</span>
            <span className="text-sm col-span-2">{order.deliveryAddress}</span>
          </div>
          {order.memo && (
            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm text-muted-foreground">備考</span>
              <span className="text-sm col-span-2 text-amber-700 bg-amber-50 rounded px-2 py-1">
                {order.memo}
              </span>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            <span className="text-sm text-muted-foreground">受付日時</span>
            <span className="text-sm col-span-2">
              {new Date(order.createdAt).toLocaleString("ja-JP")}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">操作</h3>
        <DriverOrderActions orderId={order.id} currentStatus={order.status} />
        {order.status === "DELIVERED" && (
          <p className="text-sm text-green-600 font-medium">配達が完了しました。</p>
        )}
        {order.status === "CANCELLED" && (
          <p className="text-sm text-muted-foreground">この注文はキャンセルされました。</p>
        )}
      </div>
    </div>
  );
}
