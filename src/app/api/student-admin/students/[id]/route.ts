import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit, studentAdminOrNull } from "@/lib/sadmin-api";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("toggle"), isActive: z.boolean() }),
  z.object({
    action: z.literal("reset_password"),
    newPassword: z.string().min(8, "Password must be at least 8 characters").max(72, "Password is too long"),
  }),
  z.object({
    action: z.literal("save"),
    name: z.string().trim().min(2, "Enter the student's name").max(80),
    mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    email: z.string().trim().toLowerCase().email("Enter a valid email").or(z.literal("")).default(""),
    addressLine: z.string().trim().max(200).default(""),
    city: z.string().trim().max(80).default(""),
    pincode: z.string().trim().regex(/^\d{6}$/, "Pincode must be 6 digits").or(z.literal("")).default(""),
    partnerCode: z.string().trim().toUpperCase().max(20).default(""),
  }),
]);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await studentAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const d = parsed.data;

  const student = await prisma.student.findUnique({
    where: { id },
    select: { id: true, name: true, partnerId: true, partner: { select: { referralCode: true } } },
  });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  if (d.action === "toggle") {
    await prisma.student.update({ where: { id }, data: { isActive: d.isActive } });
    await audit(admin, d.isActive ? "Student enabled" : "Student disabled", `#${id} ${student.name}`);
    return NextResponse.json({ ok: true });
  }

  if (d.action === "reset_password") {
    await prisma.student.update({
      where: { id },
      data: { passwordHash: await bcrypt.hash(d.newPassword, 10) },
    });
    // The new password is never written to the log
    await audit(admin, "Student password reset", `#${id} ${student.name}`);
    return NextResponse.json({ ok: true });
  }

  // Save details
  let partnerId = student.partnerId;
  let partnerChanged = false;
  const currentCode = student.partner?.referralCode ?? "";

  if (d.partnerCode !== currentCode) {
    // Once an order is paid, commission is linked to the partner, so the link must stay
    if ((await prisma.order.count({ where: { studentId: id, status: "PAID" } })) > 0) {
      return NextResponse.json(
        { error: "The partner cannot be changed after a paid order, because commission is already linked to them." },
        { status: 409 }
      );
    }

    if (d.partnerCode === "") {
      partnerId = null;
    } else {
      const partner = await prisma.user.findUnique({ where: { referralCode: d.partnerCode } });
      if (!partner || partner.role !== "PARTNER") {
        return NextResponse.json({ error: "Referral code not found" }, { status: 400 });
      }
      if (!partner.isActive) {
        return NextResponse.json({ error: "That referral code belongs to an inactive partner" }, { status: 400 });
      }
      partnerId = partner.id;
    }
    partnerChanged = true;
  }

  try {
    await prisma.student.update({
      where: { id },
      data: {
        name: d.name,
        mobile: d.mobile,
        email: d.email || null,
        addressLine: d.addressLine || null,
        city: d.city || null,
        pincode: d.pincode || null,
        partnerId,
        referredAt: partnerChanged ? (partnerId ? new Date() : null) : undefined,
      },
    });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "This mobile number belongs to another student" }, { status: 409 });
    }
    throw e;
  }

  await audit(
    admin,
    "Student details updated",
    `#${id} ${d.name}${partnerChanged ? ` · partner code ${currentCode || "none"} to ${d.partnerCode || "none"}` : ""}`
  );
  return NextResponse.json({ ok: true });
}