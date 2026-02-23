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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddDriverModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      email: form.get("email") as string,
      password: form.get("password") as string,
      phone: form.get("phone") as string,
      vehicle: form.get("vehicle") as string,
    };

    const res = await fetch("/api/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "登録に失敗しました");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">ドライバーを追加</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>ドライバーを新規登録</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name">氏名 *</Label>
            <Input id="name" name="name" placeholder="山田 太郎" required disabled={loading} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">メールアドレス *</Label>
            <Input id="email" name="email" type="email" placeholder="driver@example.com" required disabled={loading} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">パスワード *</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required disabled={loading} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">電話番号 *</Label>
            <Input id="phone" name="phone" placeholder="090-1234-5678" required disabled={loading} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="vehicle">車両情報 *</Label>
            <Input id="vehicle" name="vehicle" placeholder="トヨタ ハイエース / 品川 300 あ 1234" required disabled={loading} />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "登録中..." : "登録する"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
