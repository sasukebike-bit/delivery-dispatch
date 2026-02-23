import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const drivers = await prisma.driver.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { orders: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  return NextResponse.json(drivers);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, password, phone, vehicle } = body;

  if (!name || !email || !password || !phone || !vehicle) {
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "DRIVER",
      driver: {
        create: { phone, vehicle },
      },
    },
    include: {
      driver: true,
    },
  });

  return NextResponse.json(
    { id: user.driver?.id, userId: user.id, name: user.name, email: user.email, phone, vehicle },
    { status: 201 }
  );
}
