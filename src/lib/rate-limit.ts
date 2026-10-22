import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/** Visitor IP. Only trustworthy when the site sits behind your own proxy or host. */
export async function clientIp() {
  const h = await headers();
  const fwd = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (fwd || h.get("x-real-ip") || "unknown").slice(0, 64);
}

/** Returns false once a key has used up its allowance inside the time window. */
export async function allow(key: string, max: number, windowMs: number) {
  const k = key.slice(0, 180);
  const now = new Date();
  const row = await prisma.authAttempt.findUnique({ where: { key: k } });

  if (!row || row.windowStart.getTime() < now.getTime() - windowMs) {
    await prisma.authAttempt.upsert({
      where: { key: k },
      create: { key: k, count: 1, windowStart: now },
      update: { count: 1, windowStart: now },
    });
    return true;
  }
  if (row.count >= max) return false;

  await prisma.authAttempt.update({ where: { key: k }, data: { count: { increment: 1 } } });
  return true;
}

export async function resetLimit(key: string) {
  await prisma.authAttempt.deleteMany({ where: { key: key.slice(0, 180) } });
}