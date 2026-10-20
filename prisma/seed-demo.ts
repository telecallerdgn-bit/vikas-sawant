import { CourseMode, PrismaClient, ShipmentStatus } from "@prisma/client";

const prisma = new PrismaClient();

const FLOW: ShipmentStatus[] = [
  "AWAITING_PACKING",
  "PACKED",
  "LABEL_GENERATED",
  "DISPATCHED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const courses: { name: string; mode: CourseMode; price: number }[] = [
  { name: "Punjab Police Constable Exam 2027", mode: "STUDY_ONLY", price: 1499 },
  { name: "Spoken English & Interview Skills", mode: "LIVE_STUDY", price: 6499 },
  { name: "GST Practitioner Certification", mode: "STUDY_ONLY", price: 1999 },
  { name: "Advanced Accounting & Tally Prime", mode: "HYBRID", price: 11800 },
  { name: "Digital Marketing Professional", mode: "HYBRID", price: 16999 },
];

const demo = [
  { name: "Tanveer Dhillon", mobile: "9000000001", line: "12 Model Town", city: "Patiala", pin: "147001", course: 0, status: "AWAITING_PACKING" },
  { name: "Ishita Malhotra", mobile: "9000000002", line: "45 Sector 70", city: "SAS Nagar", pin: "160071", course: 1, status: "AWAITING_PACKING" },
  { name: "Gagandeep Singh", mobile: "9000000003", line: "8 Civil Lines", city: "Ludhiana", pin: "141001", course: 2, status: "PACKED", weight: 650 },
  { name: "Ananya Verma", mobile: "9000000004", line: "22 Rose Avenue", city: "Amritsar", pin: "143001", course: 3, status: "IN_TRANSIT", weight: 1200, courier: "Blue Dart", awb: "BD1490047504" },
  { name: "Sneha Kapoor", mobile: "9000000005", line: "3 Green Park", city: "Jalandhar", pin: "144001", course: 4, status: "DELIVERED", weight: 1500, courier: "DTDC", awb: "DT1490052311" },
  { name: "Yuvraj Chahal", mobile: "9000000006", line: "17 Bhupindra Road", city: "Patiala", pin: "147001", course: 1, status: "DISPATCHED", weight: 900, courier: "Delhivery Surface", awb: "DL1490039579" },
] as const;

async function main() {
  const existing = await prisma.student.count({ where: { email: { endsWith: "@demo.abc" } } });
  if (existing > 0) {
    console.log("Demo data already exists. Run prisma/clear-demo.ts first.");
    return;
  }

  const partner = await prisma.user.findFirst({ where: { role: "PARTNER", isActive: true } });

  const courseRows = [];
  for (const c of courses) {
    const found = await prisma.course.findFirst({ where: { name: c.name } });
    courseRows.push(found ?? (await prisma.course.create({ data: c })));
  }

  for (const d of demo) {
    const student = await prisma.student.create({
      data: {
        name: d.name,
        mobile: d.mobile,
        email: `${d.name.toLowerCase().replace(/\s+/g, ".")}@demo.abc`,
        addressLine: d.line,
        city: d.city,
        pincode: d.pin,
        partnerId: partner?.id ?? null,
      },
    });

    const course = courseRows[d.course];
    const idx = FLOW.indexOf(d.status);

    await prisma.order.create({
      data: {
        studentId: student.id,
        courseId: course.id,
        partnerId: partner?.id ?? null,
        amount: course.price,
        status: "PAID",
        shipment: {
          create: {
            status: d.status,
            weightGrams: "weight" in d ? d.weight : null,
            courier: "courier" in d ? d.courier : null,
            awb: "awb" in d ? d.awb : null,
            packedAt: idx >= 1 ? new Date() : null,
            events: { create: FLOW.slice(0, idx + 1).map((status) => ({ status })) },
          },
        },
      },
    });
  }

  console.log("Demo data created: 6 orders with shipments");
}

main().finally(() => prisma.$disconnect());