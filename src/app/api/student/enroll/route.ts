import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getKindSession } from "@/lib/kind-session";
import { allow } from "@/lib/rate-limit";
import { MODE_VALUES } from "@/lib/catalog";
import { modeOptions } from "@/lib/pricing";

const schema = z.object({
  courseId: z.number().int().positive(),
  mode: z.enum(MODE_VALUES),
  addressLine: z.string().trim().max(200).optional(),
  city: z.string().trim().max(80).optional(),
  pincode: z.string().trim().max(10).optional(),
});

export async function POST(req: Request) {
  const session = await getKindSession("student");
  if (!session) return NextResponse.json({ error: "Please log in first" }, { status: 401 });

  const student = await prisma.student.findUnique({
    where: { id: session.id },
    select: { id: true, isActive: true, partnerId: true, addressLine: true, city: true, pincode: true },
  });
  if (!student || !student.isActive) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  if (!(await allow(`enroll:${student.id}`, 10, 15 * 60 * 1000))) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a mode to continue" }, { status: 400 });
  const d = parsed.data;

  const course = await prisma.course.findFirst({
    where: { id: d.courseId, isActive: true, slug: { not: null } },
    include: { prices: true },
  });
  if (!course) return NextResponse.json({ error: "This course is not available" }, { status: 404 });

  // The price always comes from the server, never from the browser
  const option = modeOptions(course, Date.now()).find((m) => m.mode === d.mode);
  if (!option) return NextResponse.json({ error: "This mode is not available for the course" }, { status: 400 });

  const existing = await prisma.order.findFirst({
    where: { studentId: student.id, courseId: course.id, status: { in: ["PENDING", "PAID"] } },
    select: { status: true },
  });
  if (existing) {
    return NextResponse.json(
      {
        error:
          existing.status === "PAID"
            ? "You already own this course."
            : "You already have a pending request for this course.",
      },
      { status: 409 }
    );
  }

  let address: { addressLine: string; city: string; pincode: string } | null = null;
  if (option.needsAddress) {
    const addressLine = d.addressLine || student.addressLine || "";
    const city = d.city || student.city || "";
    const pincode = d.pincode || student.pincode || "";
    if (addressLine.length < 5) return NextResponse.json({ error: "Enter your full address" }, { status: 400 });
    if (city.length < 2) return NextResponse.json({ error: "Enter your city" }, { status: 400 });
    if (!/^\d{6}$/.test(pincode)) return NextResponse.json({ error: "Enter a valid 6 digit pincode" }, { status: 400 });
    address = { addressLine, city, pincode };
  }

  const order = await prisma.$transaction(async (tx) => {
    if (address) await tx.student.update({ where: { id: student.id }, data: address });
    return tx.order.create({
      data: {
        studentId: student.id,
        courseId: course.id,
        partnerId: student.partnerId,
        amount: option.price,
        status: "PENDING",
        mode: option.mode,
      },
      select: { id: true },
    });
  });

  return NextResponse.json({ orderId: order.id }, { status: 201 });
}