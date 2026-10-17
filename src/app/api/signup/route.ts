import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/referral";
import { createSession } from "@/lib/session";

// Set to true if new signups must be approved by an admin first
const REQUIRE_APPROVAL = false;

const schema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 }
    );
  }

  const { name, email, mobile, password } = parsed.data;

  const emailExists = await prisma.user.findUnique({ where: { email } });
  if (emailExists) {
    return NextResponse.json({ error: "This email is already registered" }, { status: 409 });
  }

  const mobileExists = await prisma.user.findUnique({ where: { mobile } });
  if (mobileExists) {
    return NextResponse.json({ error: "This mobile number is already registered" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      mobile,
      password: await bcrypt.hash(password, 10),
      role: "PARTNER", // fixed on the server, never taken from the request
      referralCode: await generateReferralCode(),
      isActive: !REQUIRE_APPROVAL,
    },
  });

  if (REQUIRE_APPROVAL) {
    return NextResponse.json({
      pending: true,
      message: "Account created. Please wait for admin approval.",
    });
  }

  await createSession({ userId: user.id, role: user.role, name: user.name });
  return NextResponse.json({ redirect: "/partner" });
}