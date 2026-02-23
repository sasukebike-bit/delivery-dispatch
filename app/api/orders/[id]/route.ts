import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      driver: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(order);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Drivers can only update status of their own orders
  if (session.user?.role === "DRIVER") {
    const driver = await prisma.driver.findFirst({
      where: { user: { email: session.user.email! } },
    });
    if (!driver || order.driverId !== driver.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // Drivers can only change status
    const { status } = body;
    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        driver: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });
    return NextResponse.json(updated);
  }

  // Admin can update all fields
  const { title, pickupAddress, deliveryAddress, memo, status, driverId } = body;

  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (pickupAddress !== undefined) updateData.pickupAddress = pickupAddress;
  if (deliveryAddress !== undefined) updateData.deliveryAddress = deliveryAddress;
  if (memo !== undefined) updateData.memo = memo;
  if (status !== undefined) updateData.status = status;

  // Handle driver assignment
  if (driverId !== undefined) {
    updateData.driverId = driverId;
    if (driverId && status === undefined) {
      updateData.status = "ASSIGNED";
    }
    // Update driver status
    if (driverId) {
      await prisma.driver.update({
        where: { id: driverId },
        data: { status: "BUSY" },
      });
    }
    // Free previous driver if unassigning
    if (!driverId && order.driverId) {
      const busyOrders = await prisma.order.count({
        where: {
          driverId: order.driverId,
          status: { in: ["ASSIGNED", "IN_TRANSIT"] },
          NOT: { id },
        },
      });
      if (busyOrders === 0) {
        await prisma.driver.update({
          where: { id: order.driverId },
          data: { status: "AVAILABLE" },
        });
      }
    }
  }

  const updated = await prisma.order.update({
    where: { id },
    data: updateData,
    include: {
      driver: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  return NextResponse.json(updated);
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
  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
