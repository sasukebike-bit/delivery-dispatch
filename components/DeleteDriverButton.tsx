"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteDriverButton({ driverId }: { driverId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/drivers/${driverId}`, { method: "DELETE" });
    router.push("/admin/drivers");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setConfirming(false)} disabled={loading}>
          キャンセル
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
          {loading ? "削除中..." : "本当に削除する"}
        </Button>
      </div>
    );
  }

  return (
    <Button variant="destructive" size="sm" onClick={() => setConfirming(true)}>
      ドライバーを削除
    </Button>
  );
}
