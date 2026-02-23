import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const driver = await prisma.driver.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!driver) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(driver);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { phone, vehicle, status } = body;

  const updateData: Record<string, unknown> = {};
  if (phone !== undefined) updateData.phone = phone;
  if (vehicle !== undefined) updateData.vehicle = vehicle;
  if (status !== undefined) updateData.status = status;

  const driver = await prisma.driver.update({
    where: { id },
    data: updateData,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(driver);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const driver = await prisma.driver.findUnique({ where: { id } });
  if (!driver) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.user.delete({ where: { id: driver.userId } });
  return NextResponse.json({ success: true });
}
