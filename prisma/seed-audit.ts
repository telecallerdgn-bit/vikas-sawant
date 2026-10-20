import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const HOUR = 60 * 60 * 1000;
const ago = (hours: number) => new Date(Date.now() - hours * HOUR);

async function main() {
  if ((await prisma.auditLog.count()) > 0) {
    console.log("Audit log already has entries, skipping.");
    return;
  }
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, orderBy: { id: "asc" } });
  const adminId = admin?.id ?? null;

  await prisma.auditLog.createMany({
    data: [
      { userId: adminId, action: "Blocked ledger modification attempt", details: "UPDATE on ledger_entries", createdAt: ago(2) },
      { userId: adminId, action: "Application under review", details: "#1 Mandeep Kaur", createdAt: ago(5) },
      { userId: null, action: "Order paid & admitted", details: "#5015 Study Material Only · ₹1,499.00", createdAt: ago(50) },
      { userId: null, action: "Order paid & admitted", details: "#5014 Live + Study Material · ₹6,499.00", createdAt: ago(51) },
      { userId: adminId, action: "Commission rules updated", details: "Partner share 40%", createdAt: ago(120) },
    ],
  });
  console.log("Demo audit entries created.");
}

main().finally(() => prisma.$disconnect());