import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const prisma = new PrismaClient();

// Courses created by the demo seed. Real courses are never touched.
const DEMO_COURSE_NAMES = [
  "Punjab Police Constable Exam 2027",
  "Spoken English & Interview Skills",
  "GST Practitioner Certification",
  "Advanced Accounting & Tally Prime",
  "Digital Marketing Professional",
];

const arg = (name: string) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
};
const flag = (name: string) => process.argv.includes(`--${name}`);
const csv = (v?: string) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);

const keepEmails = csv(arg("keep-users")).map((e) => e.toLowerCase());
const keepMobiles = csv(arg("keep-students"));

function databaseInfo() {
  let url = process.env.DATABASE_URL;
  if (!url) {
    try {
      const line = readFileSync(".env", "utf8")
        .split(/\r?\n/)
        .find((l) => l.startsWith("DATABASE_URL"));
      url = line?.split("=").slice(1).join("=").trim().replace(/^["']|["']$/g, "");
    } catch {
      /* no .env file */
    }
  }
  if (!url) return null;
  try {
    const u = new URL(url);
    return { host: u.host, db: decodeURIComponent(u.pathname.slice(1)) };
  } catch {
    return null;
  }
}

function show(title: string, rows: object[]) {
  console.log(`\n${title}`);
  if (rows.length) console.table(rows);
  else console.log("  (none)");
}

async function main() {
  const info = databaseInfo();
  console.log(`\nDatabase: ${info ? `${info.db} on ${info.host}` : "unknown"}`);

  const [users, students, courses, paid] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true },
      orderBy: { id: "asc" },
    }),
    prisma.student.findMany({
      select: { id: true, name: true, mobile: true, email: true },
      orderBy: { id: "asc" },
    }),
    prisma.course.findMany({
      select: { id: true, name: true, isActive: true, _count: { select: { orders: true } } },
      orderBy: { id: "asc" },
    }),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: { _all: true } }),
  ]);

  const usersToDelete = users.filter((u) => u.role !== "ADMIN" && !keepEmails.includes(u.email.toLowerCase()));
  const studentsToDelete = students.filter((s) => !keepMobiles.includes(s.mobile));
  const demoCourses = courses.filter((c) => DEMO_COURSE_NAMES.includes(c.name));

  const [orders, shipments, ledger, payouts, notifications, applications, audit, attempts, contacts] =
    await Promise.all([
      prisma.order.count(),
      prisma.shipment.count(),
      prisma.ledgerEntry.count(),
      prisma.payout.count(),
      prisma.notification.count(),
      prisma.partnerApplication.count(),
      prisma.auditLog.count(),
      prisma.authAttempt.count(),
      prisma.contactMessage.count(),
    ]);

  console.log("\nRows that will be removed completely");
  console.table({
    orders,
    shipments,
    ledgerEntries: ledger,
    payouts,
    notifications,
    partnerApplications: applications,
    auditLogs: flag("keep-audit") ? "kept" : audit,
    loginAttempts: attempts,
    contactMessages: contacts,
  });

  console.log(
    `\nPAID orders: ${paid._count._all}, total ₹${Number(paid._sum.amount ?? 0).toFixed(2)}` +
      `\n>>> If any of this is REAL money from a real student, STOP and do not run with --apply.`
  );

  show(
    "Users",
    users.map((u) => ({
      id: u.id,
      role: u.role,
      name: u.name,
      email: u.email,
      action: usersToDelete.includes(u) ? "DELETE" : "keep",
    }))
  );
  show(
    "Students",
    students.map((s) => ({
      id: s.id,
      name: s.name,
      mobile: s.mobile,
      action: studentsToDelete.includes(s) ? "DELETE" : "keep",
    }))
  );
  show(
    "Courses",
    courses.map((c) => ({
      id: c.id,
      name: c.name,
      orders: c._count.orders,
      action: demoCourses.includes(c) ? "DELETE (demo)" : "keep",
    }))
  );

  if (!flag("apply")) {
    console.log("\nDRY RUN. Nothing was deleted.");
    console.log(`To delete: add  --apply --confirm=${info?.db ?? "<database name>"}`);
    console.log("Keep someone: --keep-users=email1,email2   --keep-students=mobile1,mobile2");
    console.log("Other flags: --keep-audit   --reset-ids");
    return;
  }

  if (!info || arg("confirm") !== info.db) {
    console.log(`\nNot deleted. Add  --confirm=${info?.db ?? "<database name>"}  to confirm this is the right database.`);
    return;
  }

  const userIds = usersToDelete.map((u) => u.id);
  const studentIds = studentsToDelete.map((s) => s.id);
  const courseIds = demoCourses.map((c) => c.id);

  // One transaction: if anything fails, nothing is deleted
  const removed = await prisma.$transaction(
    async (tx) => {
      const r: Record<string, number> = {};
      r.notifications = (await tx.notification.deleteMany()).count;
      r.shipments = (await tx.shipment.deleteMany()).count; // tracking events go with them
      r.ledgerEntries = (await tx.ledgerEntry.deleteMany()).count;
      r.payouts = (await tx.payout.deleteMany()).count;
      r.orders = (await tx.order.deleteMany()).count;
      r.partnerApplications = (await tx.partnerApplication.deleteMany()).count;
      r.students = (await tx.student.deleteMany({ where: { id: { in: studentIds } } })).count;
      r.users = (await tx.user.deleteMany({ where: { id: { in: userIds } } })).count;
      if (!flag("keep-audit")) r.auditLogs = (await tx.auditLog.deleteMany()).count;
      r.loginAttempts = (await tx.authAttempt.deleteMany()).count;
      r.contactMessages = (await tx.contactMessage.deleteMany()).count;
      r.demoCourses = (await tx.course.deleteMany({ where: { id: { in: courseIds } } })).count;
      return r;
    },
    { timeout: 120_000, maxWait: 10_000 }
  );

  if (flag("reset-ids")) {
    // Only tables that are now empty, so the first real order becomes #1
    const empty = [
      "ShipmentEvent", "Shipment", "LedgerEntry", "Payout", "Order",
      "PartnerApplication", "Notification", "ContactMessage", "AuthAttempt",
      ...(flag("keep-audit") ? [] : ["AuditLog"]),
    ];
    for (const t of empty) await prisma.$executeRawUnsafe(`ALTER TABLE \`${t}\` AUTO_INCREMENT = 1`);
  }

  await prisma.auditLog.create({
    data: { action: "Test data cleared", details: JSON.stringify(removed) },
  });

  console.log("\nDone. Removed:");
  console.table(removed);
}

main()
  .catch((e) => {
    console.error("\nFailed, and nothing was deleted (it runs as one transaction):\n", e.message ?? e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());