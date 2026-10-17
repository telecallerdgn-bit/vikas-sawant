import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeCode() {
  let code = "PRT";
  for (let i = 0; i < 5; i++) code += CHARS[Math.floor(Math.random() * CHARS.length)];
  return code;
}

async function main() {
  const partners = await prisma.user.findMany({
    where: { role: "PARTNER", referralCode: null },
  });
  for (const p of partners) {
    await prisma.user.update({ where: { id: p.id }, data: { referralCode: makeCode() } });
  }
  console.log(`Updated ${partners.length} partners`);
}

main().finally(() => prisma.$disconnect());