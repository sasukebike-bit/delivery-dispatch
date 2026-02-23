import { StatusBadge } from "./StatusBadge";

interface OrderCardProps {
  order: {
    id: string;
    title: string;
    pickupAddress: string;
    deliveryAddress: string;
    status: string;
    createdAt: Date;
    driver?: {
      user: { name: string };
    } | null;
  };
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <div className="bg-white rounded-lg border p-4 hover:border-gray-400 transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{order.title}</p>
          <p className="text-sm text-muted-foreground mt-1 truncate">
            {order.pickupAddress} → {order.deliveryAddress}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-muted-foreground">
              {order.driver?.user.name ?? "未割当"}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString("ja-JP")}
            </span>
          </div>
        </div>
        <StatusBadge status={order.status} type="order" />
      </div>
    </div>
  );
}
