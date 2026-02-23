import { PrismaClient } from "../lib/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "管理者",
      email: "admin@example.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Created admin:", admin.email);

  // Driver 1
  const driver1Password = await bcrypt.hash("driver123", 10);
  const driver1User = await prisma.user.upsert({
    where: { email: "yamada@example.com" },
    update: {},
    create: {
      name: "山田 太郎",
      email: "yamada@example.com",
      password: driver1Password,
      role: "DRIVER",
      driver: {
        create: {
          phone: "090-1234-5678",
          vehicle: "トヨタ ハイエース / 品川 300 あ 1234",
          status: "AVAILABLE",
        },
      },
    },
    include: { driver: true },
  });
  console.log("Created driver:", driver1User.email);

  // Driver 2
  const driver2Password = await bcrypt.hash("driver123", 10);
  const driver2User = await prisma.user.upsert({
    where: { email: "suzuki@example.com" },
    update: {},
    create: {
      name: "鈴木 花子",
      email: "suzuki@example.com",
      password: driver2Password,
      role: "DRIVER",
      driver: {
        create: {
          phone: "090-8765-4321",
          vehicle: "日産 キャラバン / 横浜 400 い 5678",
          status: "AVAILABLE",
        },
      },
    },
    include: { driver: true },
  });
  console.log("Created driver:", driver2User.email);

  // Sample orders
  const driver1 = driver1User.driver;
  if (driver1) {
    await prisma.order.createMany({
      data: [
        {
          title: "東京→横浜 精密機器配送",
          pickupAddress: "東京都千代田区丸の内1-1-1",
          deliveryAddress: "神奈川県横浜市西区みなとみらい1-1",
          status: "PENDING",
        },
        {
          title: "新宿→渋谷 書類配送",
          pickupAddress: "東京都新宿区新宿3-1-1",
          deliveryAddress: "東京都渋谷区渋谷2-1-1",
          driverId: driver1.id,
          status: "ASSIGNED",
        },
        {
          title: "品川→川崎 食品配送",
          pickupAddress: "東京都品川区大崎1-1-1",
          deliveryAddress: "神奈川県川崎市川崎区駅前1-1",
          driverId: driver1.id,
          status: "IN_TRANSIT",
          memo: "冷蔵品のため取り扱い注意",
        },
      ],
      skipDuplicates: true,
    });

    // Update driver1 status since they have active orders
    await prisma.driver.update({
      where: { id: driver1.id },
      data: { status: "BUSY" },
    });
  }

  console.log("Seeding complete!");
  console.log("\nLogin credentials:");
  console.log("  Admin:  admin@example.com / admin123");
  console.log("  Driver: yamada@example.com / driver123");
  console.log("  Driver: suzuki@example.com / driver123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
