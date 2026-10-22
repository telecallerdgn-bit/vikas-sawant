import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma, PayoutStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { notifyPayout } from "@/lib/payout-notify";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({
    action: z.literal("reject"),
    note: z.string().trim().min(5, "Write a short reason for the partner").max(300),
  }),
  z.object({
    action: z.literal("mark_paid"),
    utr: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{8,30}$/, "UTR must be 8-30 letters or digits"),
  }),
]);

type Plan = {
  from: PayoutStatus[];
  data: Prisma.PayoutUncheckedUpdateManyInput;
  audit: string;
  detail: string;
  event: "approved" | "rejected" | "paid";
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "FINANCE") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  // The account must still exist, be Finance, and be active
  const me = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true, isActive: true },
  });
  if (!me || me.role !== "FINANCE" || !me.isActive) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 }
    );
  }
  const body = parsed.data;

  const payout = await prisma.payout.findUnique({ where: { id } });
  if (!payout) return NextResponse.json({ error: "Payout not found" }, { status: 404 });

  // Nobody processes their own money
  if (payout.userId === session.userId) {
    return NextResponse.json({ error: "You cannot process your own payout" }, { status: 403 });
  }

  const plan: Plan =
    body.action === "approve"
      ? {
          from: ["REQUESTED"],
          data: { status: "APPROVED", reviewedById: session.userId },
          audit: "Payout approved",
          detail: `#${id}`,
          event: "approved",
        }
      : body.action === "reject"
        ? {
            from: ["REQUESTED", "APPROVED"],
            data: { status: "REJECTED", note: body.note, reviewedById: session.userId },
            audit: "Payout rejected",
            detail: `#${id} · ${body.note}`,
            event: "rejected",
          }
        : {
            from: ["APPROVED"], // a payout must be approved before it can be paid
            data: { status: "PAID", utr: body.utr, paidAt: new Date() },
            audit: "Payout paid",
            detail: `#${id} · UTR ${body.utr}`,
            event: "paid",
          };

  if (!plan.from.includes(payout.status)) {
    return NextResponse.json({ error: "This payout cannot be changed in its current status" }, { status: 400 });
  }

  try {
    const ok = await prisma.$transaction(async (tx) => {
      // Only updates if the status is still what we read, so double clicks and two users cannot clash
      const res = await tx.payout.updateMany({
        where: { id, status: { in: plan.from } },
        data: plan.data,
      });
      if (res.count !== 1) return false;

      await tx.auditLog.create({
        data: { userId: session.userId, action: plan.audit, details: plan.detail },
      });
      return true;
    });

    if (!ok) {
      return NextResponse.json({ error: "Status changed. Please refresh." }, { status: 409 });
    }
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "This UTR is already used" }, { status: 409 });
    }
    throw e;
  }

  await notifyPayout(id, plan.event); // never throws

  return NextResponse.json({ ok: true });
}