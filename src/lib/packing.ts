import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { Prisma, ShipmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const PACKING_PAGE_SIZE = 12;

export type GroupKey = "queue" | "packed" | "labels" | "transit" | "delivered" | "exceptions";

/** Which shipment statuses belong to each sidebar item. */
export const GROUPS: Record<GroupKey, ShipmentStatus[]> = {
  queue: ["AWAITING_PACKING"],
  packed: ["PACKED"],
  labels: ["LABEL_GENERATED"],
  transit: ["DISPATCHED", "IN_TRANSIT", "OUT_FOR_DELIVERY"],
  delivered: ["DELIVERED"],
  exceptions: ["DELIVERY_FAILED", "RETURNED"],
};

export function parsePageParam(v?: string) {
  return Math.max(1, Number.parseInt(v ?? "1", 10) || 1);
}

/** Only PACKING and ADMIN can pass. Everyone else is sent away. */
export async function requirePacking() {
  const session = await getSession();
  if (!session) redirect("/login?role=packing");
  if (session.role !== "PACKING" && session.role !== "ADMIN") redirect("/portal");
  return { id: session.userId, role: session.role };
}

export async function getPackingUser(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { name: true, isActive: true, district: { select: { name: true } } },
  });
  if (!user || !user.isActive) redirect("/login?role=packing");
  return user;
}

// Only paid orders can be packed or labelled. Parcels already in motion are always shown.
const PAID_ONLY: ShipmentStatus[] = ["AWAITING_PACKING", "PACKED"];
const visibleWhere: Prisma.ShipmentWhereInput = {
  OR: [{ status: { notIn: PAID_ONLY } }, { order: { status: "PAID" } }],
};

export async function getCounts(): Promise<Record<GroupKey, number>> {
  await connection();
  const grouped = await prisma.shipment.groupBy({
    by: ["status"],
    where: visibleWhere,
    _count: { _all: true },
  });
  const by: Record<string, number> = {};
  for (const g of grouped) by[g.status] = g._count._all;
  const sum = (keys: ShipmentStatus[]) => keys.reduce((a, k) => a + (by[k] ?? 0), 0);

  return {
    queue: sum(GROUPS.queue),
    packed: sum(GROUPS.packed),
    labels: sum(GROUPS.labels),
    transit: sum(GROUPS.transit),
    delivered: sum(GROUPS.delivered),
    exceptions: sum(GROUPS.exceptions),
  };
}

export async function listShipments(group: GroupKey, page: number) {
  await connection();
  const statuses = GROUPS[group];
  const where: Prisma.ShipmentWhereInput = {
    AND: [{ status: { in: statuses } }, visibleWhere],
  };

  const [rows, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      // Oldest first for work queues, newest first for history.
      orderBy: { updatedAt: group === "queue" || group === "packed" ? "asc" : "desc" },
      skip: (page - 1) * PACKING_PAGE_SIZE,
      take: PACKING_PAGE_SIZE,
      // Delivery details only. No amount, partner or ledger data is ever selected here.
      select: {
        id: true,
        orderId: true,
        status: true,
        weightGrams: true,
        courier: true,
        awb: true,
        updatedAt: true,
        order: {
          select: {
            student: {
              select: { name: true, mobile: true, addressLine: true, city: true, pincode: true },
            },
            course: { select: { name: true, mode: true } },
          },
        },
      },
    }),
    prisma.shipment.count({ where }),
  ]);

  return { rows, total };
}