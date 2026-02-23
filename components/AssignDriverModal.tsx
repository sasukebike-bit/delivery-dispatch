"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";

interface Driver {
  id: string;
  phone: string;
  vehicle: string;
  status: string;
  user: { id: string; name: string; email: string };
}

interface AssignDriverModalProps {
  orderId: string;
  currentDriverId: string | null;
  drivers: Driver[];
}

export function AssignDriverModal({
  orderId,
  currentDriverId,
  drivers,
}: AssignDriverModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function assign(driverId: string | null) {
    setLoading(true);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driverId }),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {currentDriverId ? "ドライバーを変更" : "ドライバーを割当"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>ドライバーを割り当てる</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {currentDriverId && (
            <button
              onClick={() => assign(null)}
              disabled={loading}
              className="w-full text-left px-3 py-2 rounded border border-red-200 hover:bg-red-50 text-sm text-red-600"
            >
              割当を解除する
            </button>
          )}
          {drivers.map((driver) => (
            <button
              key={driver.id}
              onClick={() => assign(driver.id)}
              disabled={loading || driver.id === currentDriverId}
              className={`w-full text-left px-3 py-2 rounded border transition-colors ${
                driver.id === currentDriverId
                  ? "bg-blue-50 border-blue-200"
                  : "hover:bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{driver.user.name}</p>
                  <p className="text-xs text-muted-foreground">{driver.vehicle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={driver.status} type="driver" />
                  {driver.id === currentDriverId && (
                    <span className="text-xs text-blue-600">現在</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
