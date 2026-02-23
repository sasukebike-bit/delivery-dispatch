"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DriverEditFormProps {
  driver: {
    id: string;
    phone: string;
    vehicle: string;
    status: string;
  };
}

export function DriverEditForm({ driver }: DriverEditFormProps) {
  const router = useRouter();
  const [phone, setPhone] = useState(driver.phone);
  const [vehicle, setVehicle] = useState(driver.vehicle);
  const [status, setStatus] = useState(driver.status);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch(`/api/drivers/${driver.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, vehicle, status }),
    });

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="phone">電話番号</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="vehicle">車両情報</Label>
        <Input
          id="vehicle"
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="space-y-1">
        <Label>ステータス</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AVAILABLE">空き</SelectItem>
            <SelectItem value="BUSY">配送中</SelectItem>
            <SelectItem value="OFFLINE">オフライン</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "保存中..." : saved ? "保存済" : "変更を保存"}
      </Button>
    </form>
  );
}
