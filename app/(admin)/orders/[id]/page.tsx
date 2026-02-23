import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { AssignDriverModal } from "@/components/AssignDriverModal";
import { OrderActions } from "@/components/OrderActions";
import { DeleteOrderButton } from "@/components/DeleteOrderButton";
import Link from "next/link";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [order, drivers] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        driver: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    }),
    prisma.driver.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  if (!order) notFound();

  const statusOptions = [
    { value: "PENDING", label: "未割当" },
    { value: "ASSIGNED", label: "割当済" },
    { value: "IN_TRANSIT", label: "配送中" },
    { value: "DELIVERED", label: "完了" },
    { value: "CANCELLED", label: "キャンセル" },
  ];

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground text-sm">
          ← 注文一覧
        </Link>
        <h2 className="text-2xl font-bold flex-1">{order.title}</h2>
        <StatusBadge status={order.status} type="order" />
      </div>

      {/* Order details */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">配送情報</h3>
        <div className="grid gap-3">
          <DetailRow label="集荷先" value={order.pickupAddress} />
          <DetailRow label="配達先" value={order.deliveryAddress} />
          {order.memo && <DetailRow label="備考" value={order.memo} />}
          <DetailRow
            label="作成日時"
            value={new Date(order.createdAt).toLocaleString("ja-JP")}
          />
          <DetailRow
            label="更新日時"
            value={new Date(order.updatedAt).toLocaleString("ja-JP")}
          />
        </div>
      </div>

      {/* Driver assignment */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">担当ドライバー</h3>
        {order.driver ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{order.driver.user.name}</p>
              <p className="text-sm text-muted-foreground">{order.driver.user.email}</p>
              <p className="text-sm text-muted-foreground">{order.driver.vehicle}</p>
            </div>
            <AssignDriverModal
              orderId={order.id}
              currentDriverId={order.driverId}
              drivers={drivers}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">未割当</p>
            <AssignDriverModal
              orderId={order.id}
              currentDriverId={null}
              drivers={drivers}
            />
          </div>
        )}
      </div>

      {/* Status and actions */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">ステータス・操作</h3>
        <OrderActions
          orderId={order.id}
          currentStatus={order.status}
          statusOptions={statusOptions}
        />
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-lg border border-red-200 p-6 space-y-4">
        <h3 className="font-semibold text-sm text-red-500 uppercase tracking-wide">危険な操作</h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">この注文を削除します。この操作は取り消せません。</p>
          <DeleteOrderButton orderId={order.id} />
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm col-span-2">{value}</span>
    </div>
  );
}
