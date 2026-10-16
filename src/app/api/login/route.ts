import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { roleHome } from "@/lib/roles";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Email aur password sahi bharo" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: body.data.email } });
  const ok = user && (await bcrypt.compare(body.data.password, user.password));

  if (!user || !ok) {
    return NextResponse.json({ error: "Email ya password galat hai" }, { status: 401 });
  }
  if (!user.isActive) {
    return NextResponse.json({ error: "Account band hai, admin se baat karo" }, { status: 403 });
  }

  await createSession({ userId: user.id, role: user.role, name: user.name });
  return NextResponse.json({ redirect: roleHome[user.role] ?? "/" });
}