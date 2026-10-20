import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { retryNotification } from "@/lib/notify";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  // Only a failed message can be resent, and only once at a time
  const claimed = await prisma.notification.updateMany({
    where: { id, status: "FAILED" },
    data: { status: "QUEUED" },
  });
  if (claimed.count !== 1) {
    return NextResponse.json({ error: "Only failed messages can be resent" }, { status: 409 });
  }

  await retryNotification(id);

  await prisma.auditLog.create({
    data: { userId: session.userId, action: "Notification resent", details: `#${id}` },
  });

  return NextResponse.json({ ok: true });
}