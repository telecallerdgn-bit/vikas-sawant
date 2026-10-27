import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getKindSession } from "@/lib/kind-session";
import { allow, resetLimit } from "@/lib/rate-limit";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("save"),
    name: z.string().trim().min(2, "Enter your name").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email").or(z.literal("")).default(""),
    addressLine: z.string().trim().max(200).default(""),
    city: z.string().trim().max(80).default(""),
    pincode: z.string().trim().regex(/^\d{6}$/, "Pincode must be 6 digits").or(z.literal("")).default(""),
  }),
  z.object({
    action: z.literal("change_password"),
    currentPassword: z.string().min(1, "Enter your current password").max(72),
    newPassword: z.string().min(8, "New password must be at least 8 characters").max(72, "Password is too long"),
  }),
]);

export async function PATCH(req: Request) {
  const s = await getKindSession("student");
  if (!s) return NextResponse.json({ error: "Please log in again" }, { status: 401 });

  const me = await prisma.student.findUnique({
    where: { id: s.id },
    select: { id: true, isActive: true, passwordHash: true },
  });
  if (!me || !me.isActive) return NextResponse.json({ error: "Please log in again" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const d = parsed.data;

  if (d.action === "save") {
    // Mobile and partner are not editable here: the mobile is the login and the partner is tied to commission
    await prisma.student.update({
      where: { id: me.id },
      data: {
        name: d.name,
        email: d.email || null,
        addressLine: d.addressLine || null,
        city: d.city || null,
        pincode: d.pincode || null,
      },
    });
    return NextResponse.json({ ok: true });
  }

  // Change password: the current password is checked, and wrong guesses are limited
  const key = `pw:${me.id}`;
  if (!(await allow(key, 5, 15 * 60 * 1000))) {
    return NextResponse.json({ error: "Too many attempts. Please try again in 15 minutes." }, { status: 429 });
  }

  const ok = me.passwordHash ? await bcrypt.compare(d.currentPassword, me.passwordHash) : false;
  if (!ok) return NextResponse.json({ error: "Your current password is not correct" }, { status: 400 });

  if (d.currentPassword === d.newPassword) {
    return NextResponse.json({ error: "Choose a password different from the current one" }, { status: 400 });
  }

  await prisma.student.update({
    where: { id: me.id },
    data: { passwordHash: await bcrypt.hash(d.newPassword, 10) },
  });
  await resetLimit(key);
  return NextResponse.json({ ok: true });
}