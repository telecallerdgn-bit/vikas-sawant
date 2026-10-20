import { PrismaClient, OrderStatus, CourseMode, PayoutStatus } from "@prisma/client";

const prisma = new PrismaClient();
const DAY = 24 * 60 * 60 * 1000;
const ago = (days: number) => new Date(Date.now() - days * DAY);
const money = (paise: number) => (paise / 100).toFixed(2);

type Rule = { gstBp: number; feeBp: number; partnerBp: number };

// All maths is in whole paise, so there are no floating point errors.
function commissionPaise(amountRupees: number, rule: Rule) {
  const gross = Math.round(amountRupees * 100);
  const tax = gross - Math.round((gross * 10000) / (10000 + rule.gstBp));
  const fee = Math.floor((gross * rule.feeBp) / 10000);
  const distributable = Math.max(0, gross - tax - fee);
  return Math.floor((distributable * rule.partnerBp) / 10000);
}

async function main() {
  if ((await prisma.ledgerEntry.count()) > 0) {
    console.log("Ledger already has entries, skipping to avoid duplicates.");
    return;
  }

  const partners = await prisma.user.findMany({
    where: { role: "PARTNER" },
    orderBy: { id: "asc" },
    take: 4,
  });
  if (partners.length === 0) {
    console.log("No partners found. Create at least one PARTNER user first.");
    return;
  }

  // Commission rule from the database, or sensible defaults.
  const r = await prisma.commissionRule.findFirst({ orderBy: { id: "desc" } });
  const rule: Rule = {
    gstBp: Math.round(Number(r?.gstPercent ?? 18) * 100),
    feeBp: Math.round(Number(r?.gatewayFeePercent ?? 2) * 100),
    partnerBp: Math.round(Number(r?.partnerPercent ?? 40) * 100),
  };

  // Courses.
  let courses = await prisma.course.findMany({ where: { isActive: true }, orderBy: { id: "asc" }, take: 4 });
  if (courses.length === 0) {
    await prisma.course.createMany({
      data: [
        { name: "Vedic Maths Foundation", mode: CourseMode.ONLINE_PRERECORDED, price: "2500.00" },
        { name: "Vedic Maths Advanced", mode: CourseMode.HYBRID, price: "5000.00" },
        { name: "Vedic Maths Live + Books", mode: CourseMode.LIVE_STUDY, price: "7500.00" },
      ],
    });
    courses = await prisma.course.findMany({ where: { isActive: true }, orderBy: { id: "asc" }, take: 4 });
  }

  // Students.
  const names = ["Aarav Sharma", "Diya Verma", "Kabir Singh", "Anaya Gupta", "Rohan Mehta"];
  const students = [];
  for (const [i, name] of names.entries()) {
    const mobile = `90000000${String(i + 1).padStart(2, "0")}`;
    students.push(
      await prisma.student.upsert({
        where: { mobile },
        update: {},
        create: { name, mobile, partnerId: partners[i % partners.length].id },
      }),
    );
  }

  // Demo orders, only if there are none.
  if ((await prisma.order.count()) === 0) {
    let n = 0;
    const make = (partnerId: number | null, status: OrderStatus, daysAgo: number) => {
      const course = courses[n % courses.length];
      const student = students[n % students.length];
      n++;
      return prisma.order.create({
        data: {
          studentId: student.id,
          courseId: course.id,
          partnerId,
          amount: course.price,
          status,
          createdAt: ago(daysAgo),
        },
      });
    };
    for (const [i, p] of partners.entries()) {
      for (let j = 0; j < 3; j++) await make(p.id, OrderStatus.PAID, 45 - i * 6 - j * 11);
    }
    await make(partners[0].id, OrderStatus.REFUNDED, 30);
    await make(partners[1 % partners.length].id, OrderStatus.PENDING, 1);
    await make(null, OrderStatus.FAILED, 3);
    await make(null, OrderStatus.PAID, 8); // direct sale, no partner
    console.log("Demo orders created.");
  }

  // Ledger entries. Credits are positive, debits are negative.
  const entries: {
    orderId?: number;
    payoutId?: number;
    userId: number;
    type: string;
    amount: string;
    createdAt: Date;
  }[] = [];

  const orders = await prisma.order.findMany({
    where: { status: { in: [OrderStatus.PAID, OrderStatus.REFUNDED] }, partnerId: { not: null } },
    orderBy: { createdAt: "asc" },
  });
  for (const o of orders) {
    const c = commissionPaise(Number(o.amount), rule);
    if (c <= 0 || o.partnerId === null) continue;
    entries.push({ orderId: o.id, userId: o.partnerId, type: "COMMISSION", amount: money(c), createdAt: o.createdAt });
    if (o.status === OrderStatus.REFUNDED) {
      entries.push({
        orderId: o.id,
        userId: o.partnerId,
        type: "REFUND",
        amount: money(-c),
        createdAt: new Date(o.createdAt.getTime() + 2 * DAY),
      });
    }
  }

  const payouts = await prisma.payout.findMany({
    where: { status: { in: [PayoutStatus.REQUESTED, PayoutStatus.APPROVED, PayoutStatus.PAID] } },
  });
  for (const p of payouts) {
    entries.push({
      payoutId: p.id,
      userId: p.userId,
      type: "WITHDRAWAL",
      amount: money(-Math.round(Number(p.amount) * 100)),
      createdAt: p.requestedAt,
    });
  }

  await prisma.ledgerEntry.createMany({ data: entries });
  console.log(`Created ${entries.length} ledger entries.`);
}

main().finally(() => prisma.$disconnect());