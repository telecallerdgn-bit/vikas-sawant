import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSadminForApi } from "@/lib/sadmin-api";
import { BOOK_MODES } from "@/lib/pricing";
import { planCommission } from "@/lib/commission";

const schema = z.object({ status: z.enum(["PAID", "FAILED"]) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getSadminForApi();
  if (!admin || !admin.isActive) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const { status } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      status: true,
      mode: true,
      amount: true,
      partnerId: true,
      course: { select: { mode: true } },
      shipment: { select: { id: true } },
    },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "PENDING") {
    return NextResponse.json({ error: "Only pending orders can be changed" }, { status: 409 });
  }

  const mode = order.mode ?? order.course.mode;

  // Partner orders need a saved commission rule. Direct sales have no commission.
  let plan: Awaited<ReturnType<typeof planCommission>> | null = null;
  if (status === "PAID" && order.partnerId !== null) {
    plan = await planCommission({ partnerId: order.partnerId, amount: order.amount });
    if (!plan.ok) return NextResponse.json({ error: plan.error }, { status: 409 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Matches only while still pending, so two clicks cannot both go through
      const res = await tx.order.updateMany({ where: { id, status: "PENDING" }, data: { status } });
      if (res.count === 0) throw new Error("STALE");

      if (status === "PAID" && BOOK_MODES.includes(mode) && !order.shipment) {
        await tx.shipment.create({
          data: { orderId: id, events: { create: { status: "AWAITING_PACKING", note: "Order paid" } } },
        });
      }

      if (plan && plan.ok && plan.entries.length > 0) {
        await tx.ledgerEntry.createMany({
          data: plan.entries.map((e) => ({
            orderId: id,
            userId: e.userId,
            type: "COMMISSION",
            amount: (e.amountPaise / 100).toFixed(2),
          })),
        });
      }

      await tx.auditLog.create({
        data: {
          action: status === "PAID" ? "Order marked paid" : "Order marked failed",
          details: `#${id} by student admin ${admin.name}${plan && plan.ok ? ` | commission rule v${plan.version}, ${plan.entries.length} entries` : ""}`,
        },
      });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "STALE") {
      return NextResponse.json({ error: "This order was already changed" }, { status: 409 });
    }
    throw e;
  }

  return NextResponse.json({ ok: true });
}