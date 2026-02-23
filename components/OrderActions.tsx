"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderActionsProps {
  orderId: string;
  currentStatus: string;
  statusOptions: { value: string; label: string }[];
}

export function OrderActions({ orderId, currentStatus, statusOptions }: OrderActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (status === currentStatus) return;
    setLoading(true);

    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={handleSave}
        disabled={loading || status === currentStatus}
        size="sm"
      >
        {loading ? "保存中..." : saved ? "保存済" : "ステータスを更新"}
      </Button>
    </div>
  );
}
