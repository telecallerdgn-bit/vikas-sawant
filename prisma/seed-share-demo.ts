import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sub = await prisma.user.findFirst({ where: { role: "SUB_SUPER", isActive: true } });
  if (!sub) {
    console.log("Create a Sub Super user first.");
    return;
  }

  const orders = await prisma.order.findMany({
    where: { status: "PAID", student: { email: { endsWith: "@demo.abc" } } },
  });

  const existing = await prisma.ledgerEntry.count({
    where: { userId: sub.id, type: "SUB_SUPER_SHARE", orderId: { in: orders.map((o) => o.id) } },
  });
  if (existing > 0) {
    console.log("Demo share entries already exist.");
    return;
  }

  for (const o of orders) {
    await prisma.ledgerEntry.create({
      data: {
        orderId: o.id,
        userId: sub.id,
        type: "SUB_SUPER_SHARE",
        amount: Math.round(Number(o.amount) * 10) / 100,
      },
    });
  }
  console.log(`Created ${orders.length} demo share entries for ${sub.name}`);
}

main().finally(() => prisma.$disconnect());