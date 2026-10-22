import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  if (process.argv[2] === "clear") {
    const r = await prisma.payout.deleteMany({ where: { note: { startsWith: "[demo]" } } });
    console.log(`Removed ${r.count} demo payouts`);
    return;
  }

  const partner = await prisma.user.findFirst({ where: { role: "PARTNER", isActive: true } });
  if (!partner) {
    console.log("Create an active partner first.");
    return;
  }
  if ((await prisma.payout.count({ where: { note: { startsWith: "[demo]" } } })) > 0) {
    console.log("Demo payouts already exist. Run with: clear");
    return;
  }

  await prisma.payout.createMany({
    data: [
      { userId: partner.id, amount: 5200, status: "REQUESTED", note: "[demo] requested" },
      { userId: partner.id, amount: 3100, status: "APPROVED", note: "[demo] approved" },
      { userId: partner.id, amount: 1800, status: "PAID", utr: "DEMO00000001", paidAt: new Date(), note: "[demo] paid" },
    ],
  });
  console.log("Created 3 demo payouts for", partner.name);
}

main().finally(() => prisma.$disconnect());