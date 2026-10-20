import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma, ShipmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { COURIERS, SHIP_LABEL } from "@/lib/shipment";
import { notifyShipment } from "@/lib/notify";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("pack"), weightGrams: z.number().int().min(1).max(50000) }),
  z.object({
    action: z.literal("create"),
    courier: z.enum(COURIERS),
    awb: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9]{6,30}$/, "AWB must be 6-30 letters or digits")
      .transform((s) => s.toUpperCase()),
  }),
  z.object({ action: z.literal("advance") }),
  z.object({ action: z.literal("fail") }),
  z.object({ action: z.literal("retry") }),
  z.object({ action: z.literal("return") }),
]);

const ADVANCE: Partial<Record<ShipmentStatus, ShipmentStatus>> = {
  LABEL_GENERATED: "DISPATCHED",
  DISPATCHED: "IN_TRANSIT",
  IN_TRANSIT: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== "PACKING" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { id: rawId } = await params;
  if (!/^\d+$/.test(rawId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const id = Number(rawId);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const body = parsed.data;

  const shipment = await prisma.shipment.findUnique({
    where: { id },
    include: { order: { select: { status: true } } },
  });
  if (!shipment) return NextResponse.json({ error: "Shipment not found" }, { status: 404 });

  const bad = (m: string) => NextResponse.json({ error: m }, { status: 400 });
  const conflict = (m: string) => NextResponse.json({ error: m }, { status: 409 });

  let to!: ShipmentStatus;
  let data: Prisma.ShipmentUncheckedUpdateManyInput = {};
  let note: string | undefined;

  switch (body.action) {
    case "pack":
      if (shipment.status !== "AWAITING_PACKING") return conflict("Already packed");
      // Never pack a parcel for an order that is not paid (for example refunded or failed).
      if (shipment.order.status !== "PAID") return conflict("This order is not paid, so it cannot be packed");
      to = "PACKED";
      data = { weightGrams: body.weightGrams, packedAt: new Date(), packedById: session.userId };
      note = `${body.weightGrams} g`;
      break;

    case "create":
      if (shipment.status !== "PACKED") return conflict("Pack the order first");
      if (shipment.order.status !== "PAID") return conflict("This order is not paid, so it cannot be shipped");
      to = "LABEL_GENERATED";
      data = { courier: body.courier, awb: body.awb };
      note = `${body.courier} · AWB ${body.awb}`;
      break;

    case "advance": {
      const next = ADVANCE[shipment.status];
      if (!next) return conflict("No further update from this status");
      to = next;
      break;
    }

    case "fail":
      if (shipment.status !== "OUT_FOR_DELIVERY") return conflict("Not allowed now");
      to = "DELIVERY_FAILED";
      break;

    case "retry":
      if (shipment.status !== "DELIVERY_FAILED") return conflict("Not allowed now");
      to = "OUT_FOR_DELIVERY";
      break;

    case "return":
      if (shipment.status !== "DELIVERY_FAILED") return conflict("Not allowed now");
      to = "RETURNED";
      break;

    default:
      return bad("Unknown action");
  }

  try {
    const ok = await prisma.$transaction(async (tx) => {
      // Only update if the status is still what we read (prevents double clicks and races)
      const res = await tx.shipment.updateMany({
        where: { id, status: shipment.status },
        data: { ...data, status: to },
      });
      if (res.count !== 1) return false;

      await tx.shipmentEvent.create({ data: { shipmentId: id, status: to, note } });
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: `Shipment ${SHIP_LABEL[to]}`,
          details: `Order #${shipment.orderId}${note ? " · " + note : ""}`,
        },
      });
      return true;
    });

    if (!ok) {
      return conflict("Status changed. Please refresh.");
    }
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") {
      return conflict("This AWB is already used");
    }
    console.error("Shipment update failed", e);
    return NextResponse.json({ error: "Could not update the shipment" }, { status: 500 });
  }

  // A notification problem must never fail a request whose database changes already succeeded.
  try {
    await notifyShipment(id, to);
  } catch (e) {
    console.error("Shipment notification failed", e);
  }

  return NextResponse.json({ ok: true });
}