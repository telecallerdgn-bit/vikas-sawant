import { prisma } from "@/lib/prisma";

/** The mobile and email this student receives messages on. */
export function recipientsOf(me: { mobile: string; email: string | null }) {
  return [me.mobile, me.email].filter((v): v is string => Boolean(v));
}

// Only the fields a student may see. Provider and error details stay private.
export async function notificationsFor(recipients: string[], take: number) {
  if (recipients.length === 0) return [];
  return prisma.notification.findMany({
    where: { recipient: { in: recipients } },
    orderBy: { createdAt: "desc" },
    take,
    select: { id: true, channel: true, message: true, createdAt: true },
  });
}

export async function recentNotificationCount(recipients: string[], since: Date) {
  if (recipients.length === 0) return 0;
  return prisma.notification.count({
    where: { recipient: { in: recipients }, createdAt: { gte: since } },
  });
}