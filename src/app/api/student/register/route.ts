import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createKindSession } from "@/lib/kind-session";
import { allow, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z.string().trim().toLowerCase().email("Enter a valid email").optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters").max(72, "Password is too long"),
  referralCode: z.string().trim().toUpperCase().max(20).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const d = parsed.data;

  const ip = await clientIp();
  if (!(await allow(`reg:${ip}`, 10, 60 * 60 * 1000))) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  if (await prisma.student.findUnique({ where: { mobile: d.mobile } })) {
    return NextResponse.json(
      { error: "This mobile number is already registered. Please log in." },
      { status: 409 }
    );
  }

  // Optional referral: links the student to the partner for good
  let partnerId: number | null = null;
  if (d.referralCode) {
    const partner = await prisma.user.findUnique({ where: { referralCode: d.referralCode } });
    if (!partner || partner.role !== "PARTNER") {
      return NextResponse.json({ error: "Referral code not found. Check it or leave it blank." }, { status: 400 });
    }
    if (!partner.isActive) {
      return NextResponse.json({ error: "That referral code belongs to an inactive partner." }, { status: 400 });
    }
    partnerId = partner.id;
  }

  try {
    const student = await prisma.student.create({
      data: {
        name: d.name,
        mobile: d.mobile,
        email: d.email || null,
        passwordHash: await bcrypt.hash(d.password, 10),
        partnerId,
        referredAt: partnerId ? new Date() : null,
      },
      select: { id: true, name: true },
    });

    await createKindSession("student", student);
    return NextResponse.json({ redirect: "/student/dashboard" }, { status: 201 });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "This mobile number is already registered. Please log in." }, { status: 409 });
    }
    throw e;
  }
}