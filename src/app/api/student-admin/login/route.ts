import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createKindSession } from "@/lib/kind-session";
import { allow, clientIp, resetLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(72),
});

const WINDOW = 15 * 60 * 1000;
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your email and password" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const ip = await clientIp();
  if (!(await allow(`sa-ip:${ip}`, 10, WINDOW)) || !(await allow(`sa-e:${email}`, 5, WINDOW))) {
    return NextResponse.json({ error: "Too many attempts. Please try again in 15 minutes." }, { status: 429 });
  }

  const admin = await prisma.studentAdmin.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_HASH);

  if (!admin || !ok) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  if (!admin.isActive) {
    return NextResponse.json({ error: "This account is disabled." }, { status: 403 });
  }

  await resetLimit(`sa-e:${email}`);
  await createKindSession("sadmin", { id: admin.id, name: admin.name });
  return NextResponse.json({ redirect: "/student-admin" });
}