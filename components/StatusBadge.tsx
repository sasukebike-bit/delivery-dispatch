import { Badge } from "@/components/ui/badge";

const ORDER_LABELS: Record<string, string> = {
  PENDING: "未割当",
  ASSIGNED: "割当済",
  IN_TRANSIT: "配送中",
  DELIVERED: "完了",
  CANCELLED: "キャンセル",
};

const ORDER_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  ASSIGNED: "default",
  IN_TRANSIT: "default",
  DELIVERED: "outline",
  CANCELLED: "destructive",
};

const ORDER_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  IN_TRANSIT: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const DRIVER_LABELS: Record<string, string> = {
  AVAILABLE: "空き",
  BUSY: "配送中",
  OFFLINE: "オフライン",
};

const DRIVER_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  BUSY: "bg-orange-100 text-orange-700",
  OFFLINE: "bg-gray-100 text-gray-700",
};

export function StatusBadge({
  status,
  type,
}: {
  status: string;
  type: "order" | "driver";
}) {
  if (type === "order") {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ORDER_COLORS[status] ?? "bg-gray-100 text-gray-700"}`}
      >
        {ORDER_LABELS[status] ?? status}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${DRIVER_COLORS[status] ?? "bg-gray-100 text-gray-700"}`}
    >
      {DRIVER_LABELS[status] ?? status}
    </span>
  );
}
