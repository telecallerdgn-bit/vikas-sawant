import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const [, , emailArg, passArg, ...rest] = process.argv;

async function main() {
  if (!emailArg || !passArg) {
    console.log("Usage: npx tsx prisma/set-password.ts <email> '<new password>' [--student-admin]");
    return;
  }
  if (passArg.length < 12) return console.log("Use at least 12 characters.");

  const email = emailArg.trim().toLowerCase();
  const hash = await bcrypt.hash(passArg, 10);

  const count = rest.includes("--student-admin")
    ? (await prisma.studentAdmin.updateMany({ where: { email }, data: { passwordHash: hash } })).count
    : (await prisma.user.updateMany({ where: { email }, data: { password: hash } })).count;

  console.log(count ? "Password changed." : "No account with that email.");
}

main().finally(() => prisma.$disconnect());