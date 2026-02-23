"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface DriverOrderActionsProps {
  orderId: string;
  currentStatus: string;
}

export function DriverOrderActions({ orderId, currentStatus }: DriverOrderActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    setLoading(true);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      {currentStatus === "ASSIGNED" && (
        <Button
          size="sm"
          onClick={() => updateStatus("IN_TRANSIT")}
          disabled={loading}
        >
          配送開始
        </Button>
      )}
      {currentStatus === "IN_TRANSIT" && (
        <Button
          size="sm"
          onClick={() => updateStatus("DELIVERED")}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          配達完了
        </Button>
      )}
    </div>
  );
}
