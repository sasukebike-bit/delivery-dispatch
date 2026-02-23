"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      title: form.get("title") as string,
      pickupAddress: form.get("pickupAddress") as string,
      deliveryAddress: form.get("deliveryAddress") as string,
      memo: form.get("memo") as string,
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "作成に失敗しました");
      return;
    }

    const order = await res.json();
    router.push(`/admin/orders/${order.id}`);
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground text-sm">
          ← 注文一覧
        </Link>
        <h2 className="text-2xl font-bold">新規注文作成</h2>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">件名 *</Label>
              <Input
                id="title"
                name="title"
                placeholder="例: 東京→大阪 精密機器配送"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupAddress">集荷先 *</Label>
              <Input
                id="pickupAddress"
                name="pickupAddress"
                placeholder="例: 東京都千代田区丸の内1-1-1"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">配達先 *</Label>
              <Input
                id="deliveryAddress"
                name="deliveryAddress"
                placeholder="例: 大阪府大阪市北区梅田1-1-1"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memo">備考</Label>
              <Textarea
                id="memo"
                name="memo"
                placeholder="配送上の注意事項など"
                rows={3}
                disabled={loading}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? "作成中..." : "注文を作成"}
              </Button>
              <Link href="/admin/orders">
                <Button type="button" variant="outline">
                  キャンセル
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
