import { StatusBadge } from "./StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface DriverCardProps {
  driver: {
    id: string;
    phone: string;
    vehicle: string;
    status: string;
    user: { id: string; name: string; email: string };
    _count?: { orders: number };
  };
}

export function DriverCard({ driver }: DriverCardProps) {
  return (
    <Link href={`/admin/drivers/${driver.id}`}>
      <Card className="hover:border-gray-400 transition-colors cursor-pointer">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-medium">{driver.user.name}</p>
            <StatusBadge status={driver.status} type="driver" />
          </div>
          <p className="text-sm text-muted-foreground">{driver.user.email}</p>
          <p className="text-sm text-muted-foreground truncate">{driver.vehicle}</p>
          <p className="text-sm text-muted-foreground">{driver.phone}</p>
          {driver._count && (
            <p className="text-xs text-muted-foreground">
              総注文数: {driver._count.orders}件
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
