import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Admin@123", 10);

  await prisma.user.upsert({
    where: { email: "admin@abcacademy.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@abcacademy.com",
      password,
      role: "ADMIN",
    },
  });

  console.log("Admin user ready");
}

main().finally(() => prisma.$disconnect());