import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Usage: npx tsx prisma/seed-student-admin.ts "Name" email@example.com "StrongPassword"
const [, , nameArg, emailArg, passArg] = process.argv;
const name = nameArg ?? "Student Admin";
const email = (emailArg ?? "studentadmin@abcacademy.com").toLowerCase();
const password = passArg ?? "StudentAdmin@123";

async function main() {
  if (!passArg) console.log("No password given, using the default test password. Change it before going live.");

  if (await prisma.studentAdmin.findUnique({ where: { email } })) {
    console.log(`Student Admin ${email} already exists.`);
    return;
  }

  await prisma.studentAdmin.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 10) },
  });
  console.log(`Student Admin created: ${email}`);
}

main().finally(() => prisma.$disconnect());