import { PrismaClient, PayoutStatus } from "@prisma/client";

const prisma = new PrismaClient();
const DAY = 24 * 60 * 60 * 1000;

async function main() {
  if ((await prisma.payout.count()) > 0) {
    console.log("Payouts already exist, skipping.");
    return;
  }
  const partners = await prisma.user.findMany({
    where: { role: "PARTNER" },
    orderBy: { id: "asc" },
    take: 4,
  });
  if (partners.length === 0) {
    console.log("No partners found. Create partners first.");
    return;
  }
  const rows = [
    { amount: 5000, status: PayoutStatus.REQUESTED, ago: 1 },
    { amount: 7500, status: PayoutStatus.APPROVED, ago: 3 },
    { amount: 6200, status: PayoutStatus.PAID, ago: 12, utr: "DEMO-UTR-0001" },
    { amount: 5000, status: PayoutStatus.REJECTED, ago: 20, note: "Demo: bank details mismatch" },
  ];
  for (const [i, r] of rows.entries()) {
    const partner = partners[i % partners.length];
    await prisma.payout.create({
      data: {
        userId: partner.id,
        amount: r.amount,
        status: r.status,
        utr: r.utr,
        note: r.note,
        requestedAt: new Date(Date.now() - r.ago * DAY),
        paidAt: r.status === PayoutStatus.PAID ? new Date(Date.now() - (r.ago - 2) * DAY) : null,
      },
    });
  }
  console.log("Demo payouts created.");
}

main().finally(() => prisma.$disconnect());