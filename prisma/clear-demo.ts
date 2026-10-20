import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const courseNames = [
  "Punjab Police Constable Exam 2027",
  "Spoken English & Interview Skills",
  "GST Practitioner Certification",
  "Advanced Accounting & Tally Prime",
  "Digital Marketing Professional",
];

async function main() {
  const students = await prisma.student.findMany({
    where: { email: { endsWith: "@demo.abc" } },
    select: { id: true },
  });
  const ids = students.map((s) => s.id);

  await prisma.shipment.deleteMany({ where: { order: { studentId: { in: ids } } } });
  await prisma.ledgerEntry.deleteMany({ where: { order: { studentId: { in: ids } } } });
  await prisma.order.deleteMany({ where: { studentId: { in: ids } } });
  await prisma.student.deleteMany({ where: { id: { in: ids } } });
  await prisma.course.deleteMany({ where: { name: { in: courseNames }, orders: { none: {} } } });

  console.log(`Removed demo data (${ids.length} students)`);
}

main().finally(() => prisma.$disconnect());