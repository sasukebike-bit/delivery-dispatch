import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OrderCard } from "@/components/OrderCard";

const STATUS_OPTIONS = [
  { value: "", label: "すべて" },
  { value: "PENDING", label: "未割当" },
  { value: "ASSIGNED", label: "割当済" },
  { value: "IN_TRANSIT", label: "配送中" },
  { value: "DELIVERED", label: "完了" },
  { value: "CANCELLED", label: "キャンセル" },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "";

  const orders = await prisma.order.findMany({
    where: status ? { status: status as never } : undefined,
    include: {
      driver: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">注文一覧</h2>
        <Link href="/admin/orders/new">
          <Button size="sm">新規注文</Button>
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={opt.value ? `/admin/orders?status=${opt.value}` : "/admin/orders"}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              status === opt.value
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-gray-100 border-gray-200"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <Link key={order.id} href={`/admin/orders/${order.id}`}>
            <OrderCard order={order} />
          </Link>
        ))}
        {orders.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">
            注文が見つかりません
          </p>
        )}
      </div>
    </div>
  );
}
