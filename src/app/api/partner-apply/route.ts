import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { notifyApplication } from "@/lib/notify";

const schema = z.object({
  name: z.string().trim().min(3, "Enter your full name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  districtId: z.number().int().optional(),
  referralCode: z.string().trim().toUpperCase().optional(),
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{5}\d{4}[A-Z]$/, "PAN must look like ABCDE1234F"),
  experience: z.string().trim().min(10, "Tell us a little about your experience").max(1000),
  terms: z.literal(true, { message: "Accept the Partner Agreement to continue" }),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 }
    );
  }
  const d = parsed.data;

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email: d.email }, { mobile: d.mobile }] },
  });
  if (existingUser) {
    return NextResponse.json(
      { error: "This email or mobile is already registered. Please log in." },
      { status: 409 }
    );
  }

  const openApp = await prisma.partnerApplication.findFirst({
    where: { OR: [{ email: d.email }, { mobile: d.mobile }], status: { not: "REJECTED" } },
  });
  if (openApp) {
    return NextResponse.json(
      { error: "An application with this email or mobile already exists." },
      { status: 409 }
    );
  }

  let sponsorId: number | null = null;
  if (d.referralCode) {
    const sponsor = await prisma.user.findUnique({ where: { referralCode: d.referralCode } });
    if (!sponsor || sponsor.role !== "PARTNER") {
      return NextResponse.json(
        { error: "Referral code not found. Check it or leave it blank." },
        { status: 400 }
      );
    }
    if (!sponsor.isActive) {
      return NextResponse.json(
        { error: "That referral code belongs to an inactive partner." },
        { status: 400 }
      );
    }
    sponsorId = sponsor.id;
  }

  const app = await prisma.partnerApplication.create({
    data: {
      name: d.name,
      email: d.email,
      mobile: d.mobile,
      passwordHash: await bcrypt.hash(d.password, 10),
      panMasked: `XXXXX${d.pan.slice(5, 9)}X`, // full PAN is never stored
      experience: d.experience,
      districtId: d.districtId ?? null,
      sponsorId,
    },
    select: { id: true },
  });

  await prisma.auditLog.create({
    data: { action: "Partner application submitted", details: `#${app.id} · ${d.name}` },
  });

  await notifyApplication(app.id, "submitted"); // never throws

  return NextResponse.json({ ok: true }, { status: 201 });
}