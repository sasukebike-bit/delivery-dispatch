import { prisma } from "@/lib/db";
import { DriverCard } from "@/components/DriverCard";
import { AddDriverModal } from "@/components/AddDriverModal";

export default async function DriversPage() {
  const drivers = await prisma.driver.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { orders: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">ドライバー一覧</h2>
        <AddDriverModal />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {drivers.map((driver) => (
          <DriverCard key={driver.id} driver={driver} />
        ))}
        {drivers.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full text-center py-12">
            ドライバーが登録されていません
          </p>
        )}
      </div>
    </div>
  );
}
