import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createKindSession } from "@/lib/kind-session";
import { allow, clientIp, resetLimit } from "@/lib/rate-limit";

const schema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  password: z.string().min(1).max(72),
});

const WINDOW = 15 * 60 * 1000;
// Compared when the mobile is unknown, so response time does not reveal which numbers exist
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your mobile number and password" }, { status: 400 });
  }
  const { mobile, password } = parsed.data;

  const ip = await clientIp();
  if (!(await allow(`sl-ip:${ip}`, 30, WINDOW)) || !(await allow(`sl-m:${mobile}`, 10, WINDOW))) {
    return NextResponse.json({ error: "Too many attempts. Please try again in 15 minutes." }, { status: 429 });
  }

  const student = await prisma.student.findUnique({ where: { mobile } });
  const ok = await bcrypt.compare(password, student?.passwordHash ?? DUMMY_HASH);

  if (!student || !student.passwordHash || !ok) {
    return NextResponse.json({ error: "Invalid mobile number or password" }, { status: 401 });
  }
  if (!student.isActive) {
    return NextResponse.json({ error: "This account is disabled. Please contact support." }, { status: 403 });
  }

  await resetLimit(`sl-m:${mobile}`);
  await createKindSession("student", { id: student.id, name: student.name });
  return NextResponse.json({ redirect: "/student/dashboard" });
}