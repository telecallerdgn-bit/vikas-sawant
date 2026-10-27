import { OrderStatus, type CommissionRuleVersion } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DEFAULT_RULE, splitOrder, validateRule, type Person, type RuleValues } from "@/lib/commission-calc";

/** Database ki row ko RuleValues me badalta hai (Decimal -> number). */
export function toRuleValues(row: CommissionRuleVersion): RuleValues {
  return {
    levels: [row.level1Percent, row.level2Percent, row.level3Percent, row.level4Percent, row.level5Percent].map(Number),
    district: Number(row.districtPercent),
    subSuper: Number(row.subSuperPercent),
    subSuperBase: row.subSuperBase,
    inactive: row.inactiveRule,
    gateway: row.gatewayMode,
    gstPercent: Number(row.gstPercent),
    gatewayFeePercent: Number(row.gatewayFeePercent),
  };
}

/** Sabse naya version (yahi "current" rule hai). Koi version nahi to null. */
export async function getCurrentVersion() {
  return prisma.commissionRuleVersion.findFirst({ orderBy: { version: "desc" } });
}

/**
 * Partner se upar ki taraf sponsor chain (partner, uska sponsor, uska sponsor ...).
 * Sirf PARTNER role wale log aate hain. Asli commission engine bhi isi ko use karega.
 */
export async function buildChain(partnerId: number, maxHops = 10): Promise<Person[]> {
  const chain: Person[] = [];
  const seen = new Set<number>();
  let id: number | null = partnerId;

  while (id !== null && chain.length < maxHops && !seen.has(id)) {
    seen.add(id);
    const u: { name: string; isActive: boolean; role: string; parentId: number | null } | null =
      await prisma.user.findUnique({
        where: { id },
        select: { name: true, isActive: true, role: true, parentId: true },
      });
    if (!u || u.role !== "PARTNER") break;
    chain.push({ id, name: u.name, active: u.isActive });
    id = u.parentId;
  }
  return chain;
}

/** Sub Super Admin: abhi maana gaya hai ki ek hi Sub Super Admin hota hai (sabse purana active user). */
export async function findSubSuper(): Promise<Person | null> {
  const u = await prisma.user.findFirst({
    where: { role: "SUB_SUPER", isActive: true },
    orderBy: { id: "asc" },
    select: { id: true, name: true, isActive: true },
  });
  return u ? { id: u.id, name: u.name, active: u.isActive } : null;
}

export type CommissionEntry = { userId: number; amountPaise: number };

export type CommissionPlan =
  | { ok: true; version: number; entries: CommissionEntry[] }
  | { ok: false; error: string };

/**
 * Ek paid hone wale order ka commission: kis user ko kitna paisa jayega.
 * Sabse naya saved version use hota hai (owner-approved hona zaruri nahi).
 * Rule na ho ya galat ho to ok: false, taaki order bina hisaab ke paid na ho jaye.
 */
export async function planCommission(order: { partnerId: number; amount: unknown }): Promise<CommissionPlan> {
  const current = await getCurrentVersion();
  if (!current) return { ok: false, error: "Save a commission rule in Commission Rules before marking partner orders as paid." };

  const rule = toRuleValues(current);
  const problem = validateRule(rule);
  if (problem) return { ok: false, error: `The saved commission rule is not valid: ${problem}` };

  const partner = await prisma.user.findUnique({
    where: { id: order.partnerId },
    select: { district: { select: { admin: { select: { id: true, name: true, isActive: true } } } } },
  });
  const admin = partner?.district?.admin;

  const split = splitOrder({
    pricePaise: Math.round(Number(order.amount) * 100),
    rule,
    chain: await buildChain(order.partnerId),
    districtAdmin: admin ? { id: admin.id, name: admin.name, active: admin.isActive } : null,
    subSuper: await findSubSuper(),
  });

  const entries: CommissionEntry[] = [];
  for (const l of split.lines) {
    if (l.userId && l.paise > 0) entries.push({ userId: l.userId, amountPaise: l.paise });
  }
  return { ok: true, version: current.version, entries };
}

export type PreviewSample = {
  isReal: boolean;
  title: string;
  partnerName: string;
  pricePaise: number;
  chain: Person[];
  districtAdmin: Person | null;
  subSuper: Person | null;
};

/** Live preview ke liye ek namuna order: sabse naya paid order, nahi to banawati namuna. */
export async function getPreviewSample(): Promise<PreviewSample> {
  const subSuper = await findSubSuper();

  const order = await prisma.order.findFirst({
    where: { status: OrderStatus.PAID, partnerId: { not: null } },
    orderBy: { createdAt: "desc" },
    select: {
      amount: true,
      course: { select: { name: true } },
      partner: {
        select: {
          id: true,
          name: true,
          district: { select: { admin: { select: { id: true, name: true, isActive: true } } } },
        },
      },
    },
  });

  if (order?.partner) {
    const admin = order.partner.district?.admin;
    return {
      isReal: true,
      title: order.course.name,
      partnerName: order.partner.name,
      pricePaise: Math.round(Number(order.amount) * 100),
      chain: await buildChain(order.partner.id),
      districtAdmin: admin ? { id: admin.id, name: admin.name, active: admin.isActive } : null,
      subSuper,
    };
  }

  // Abhi koi paid order nahi: namuna dikhao, taaki page khali na lage
  return {
    isReal: false,
    title: "Sample course",
    partnerName: "Partner A",
    pricePaise: 1180000,
    chain: [
      { name: "Partner A", active: true },
      { name: "Partner B", active: true },
      { name: "Partner C", active: false },
      { name: "Partner D", active: true },
      { name: "Partner E", active: true },
    ],
    districtAdmin: { name: "District admin", active: true },
    subSuper: subSuper ?? { name: "Sub Super Admin", active: true },
  };
}

export { DEFAULT_RULE };