import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const HOLD_DAYS = 15;
export const PAGE_SIZE = 20;
/** Path of the sign-up page that reads ?ref=CODE. Change it if your sign-up page uses another path. */
export const REFERRAL_PATH = "/signup";

const DAY = 24 * 60 * 60 * 1000;
const toPaise = (v: unknown) => Math.round(Number(v ?? 0) * 100);

export function parsePage(v?: string) {
  return Math.max(1, Number.parseInt(v ?? "1", 10) || 1);
}

/** Only an active PARTNER can pass. Everyone else is sent away. */
export async function requirePartner() {
  const session = await getSession();
  if (!session) redirect("/login?role=partner");
  if (session.role !== "PARTNER") redirect("/");
  return { id: session.userId };
}

export async function getPartnerProfile(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      referralCode: true,
      isActive: true,
      createdAt: true,
      district: { select: { name: true } },
    },
  });
  if (!user || !user.isActive) redirect("/login?role=partner");
  return user;
}

export async function getSiteOrigin() {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function getWallet(userId: number) {
  await connection();
  const since = new Date(Date.now() - HOLD_DAYS * DAY);
  const [all, credits, recent] = await Promise.all([
    prisma.ledgerEntry.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.ledgerEntry.aggregate({ where: { userId, amount: { gt: 0 } }, _sum: { amount: true } }),
    prisma.ledgerEntry.aggregate({
      where: { userId, amount: { gt: 0 }, createdAt: { gt: since } },
      _sum: { amount: true },
    }),
  ]);
  const balance = toPaise(all._sum.amount);
  const earned = toPaise(credits._sum.amount);
  // Money earned in the last 15 days is on hold and cannot be withdrawn yet.
  const hold = Math.min(toPaise(recent._sum.amount), Math.max(0, balance));
  const available = Math.max(0, balance - hold);
  return { earned: earned / 100, balance: balance / 100, hold: hold / 100, available: available / 100 };
}

export function getStudentCount(userId: number) {
  return prisma.student.count({ where: { partnerId: userId } });
}

/** Downline by level (1 to 5). Personal data is limited to what the partner needs to see. */
export async function getNetwork(userId: number) {
  const levels: {
    level: number;
    members: {
      id: number;
      name: string;
      isActive: boolean;
      createdAt: Date;
      district: { name: string } | null;
    }[];
  }[] = [];
  let parents = [userId];
  for (let level = 1; level <= 5 && parents.length > 0; level++) {
    const members = await prisma.user.findMany({
      where: { parentId: { in: parents } },
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
        district: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    if (members.length === 0) break;
    levels.push({ level, members });
    parents = members.map((m) => m.id);
  }
  return levels;
}

function estimateCommission(price: number, gstBp: number, feeBp: number, partnerBp: number) {
  const gross = Math.round(price * 100);
  const tax = gross - Math.round((gross * 10000) / (10000 + gstBp));
  const fee = Math.floor((gross * feeBp) / 10000);
  const distributable = Math.max(0, gross - tax - fee);
  return Math.floor((distributable * partnerBp) / 10000) / 100;
}

/** Active courses with an approximate commission, using the latest commission rule. */
export async function getCoursesWithEarning() {
  const [courses, rule] = await Promise.all([
    prisma.course.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.commissionRule.findFirst({ orderBy: { id: "desc" } }),
  ]);
  const gstBp = Math.round(Number(rule?.gstPercent ?? 18) * 100);
  const feeBp = Math.round(Number(rule?.gatewayFeePercent ?? 2) * 100);
  const partnerBp = Math.round(Number(rule?.partnerPercent ?? 40) * 100);
  return courses.map((c) => {
    const price = Number(c.price);
    return { id: c.id, name: c.name, mode: c.mode, price, earning: estimateCommission(price, gstBp, feeBp, partnerBp) };
  });
}