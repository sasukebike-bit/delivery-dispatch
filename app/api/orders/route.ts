import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const driverId = searchParams.get("driverId");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (driverId) where.driverId = driverId;

  // Drivers can only see their own orders
  if (session.user?.role === "DRIVER") {
    const driver = await prisma.driver.findFirst({
      where: { user: { email: session.user.email! } },
    });
    if (!driver) return NextResponse.json([]);
    where.driverId = driver.id;
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      driver: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, pickupAddress, deliveryAddress, memo } = body;

  if (!title || !pickupAddress || !deliveryAddress) {
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: { title, pickupAddress, deliveryAddress, memo },
  });

  return NextResponse.json(order, { status: 201 });
}
