import { PrismaClient, type CourseMode } from "@prisma/client";

const prisma = new PrismaClient();
const BOOK_MODES: CourseMode[] = ["LIVE_STUDY", "STUDY_ONLY", "HYBRID"];

// Create: npx tsx prisma/seed-student-order.ts 9000011112
// Delete: npx tsx prisma/seed-student-order.ts delete 12
const [, , a, b] = process.argv;

async function remove(id: number) {
  const order = await prisma.order.findUnique({ where: { id }, include: { _count: { select: { ledger: true } } } });
  if (!order) return console.log("Order not found.");
  if (order._count.ledger > 0) return console.log("This order has ledger entries, so it is not a test order. Not deleted.");

  await prisma.shipment.deleteMany({ where: { orderId: id } });
  await prisma.order.delete({ where: { id } });
  console.log(`Deleted test order #${id}`);
}

async function create(mobile: string) {
  const student = await prisma.student.findUnique({ where: { mobile } });
  if (!student) return console.log("No student with that mobile number.");

  const course = await prisma.course.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: { prices: true },
  });
  if (!course) return console.log("Add a course first.");

  const price = [...course.prices].sort((x, y) => Number(x.price) - Number(y.price))[0] ?? {
    mode: course.mode,
    price: course.price,
  };

  const order = await prisma.order.create({
    data: {
      studentId: student.id,
      courseId: course.id,
      partnerId: student.partnerId,
      amount: price.price,
      mode: price.mode,
      status: "PAID",
      ...(BOOK_MODES.includes(price.mode)
        ? {
            shipment: {
              create: { status: "AWAITING_PACKING", events: { create: [{ status: "AWAITING_PACKING" }] } },
            },
          }
        : {}),
    },
  });

  console.log(`Created test order #${order.id} for ${student.name}: ${course.name} (${price.mode})`);
  console.log(`Remove later with: npx tsx prisma/seed-student-order.ts delete ${order.id}`);
}

async function main() {
  if (a === "delete") return remove(Number(b));
  if (a && /^[6-9]\d{9}$/.test(a)) return create(a);
  console.log("Usage: seed-student-order.ts <10-digit mobile>  |  seed-student-order.ts delete <orderId>");
}

main().finally(() => prisma.$disconnect());