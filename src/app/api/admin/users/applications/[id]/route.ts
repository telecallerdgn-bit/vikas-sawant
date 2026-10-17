import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { activateIfReady } from "@/lib/applications";

const schema = z.object({
  action: z.enum(["review", "approve", "more_info", "reject", "mark_fee_paid"]),
  note: z.string().trim().min(5, "Write a short message for the applicant").max(500).optional(),
});

const OPEN = ["SUBMITTED", "UNDER_REVIEW", "MORE_INFO"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { id } = await params;
  const appId = Number(id);
  if (!Number.isInteger(appId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 }
    );
  }
  const { action, note } = parsed.data;

  const app = await prisma.partnerApplication.findUnique({ where: { id: appId } });
  if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  const bad = (m: string) => NextResponse.json({ error: m }, { status: 400 });

  switch (action) {
    case "review":
      if (app.status !== "SUBMITTED") return bad("Only a new application can be moved to review");
      await prisma.partnerApplication.update({ where: { id: appId }, data: { status: "UNDER_REVIEW" } });
      break;

    case "approve":
      if (!OPEN.includes(app.status)) return bad("This application cannot be approved now");
      await prisma.partnerApplication.update({
        where: { id: appId },
        data: { status: "APPROVED", note: null },
      });
      break;

    case "more_info":
      if (app.status !== "SUBMITTED" && app.status !== "UNDER_REVIEW") return bad("Not allowed now");
      if (!note) return bad("Write a short message for the applicant");
      await prisma.partnerApplication.update({ where: { id: appId }, data: { status: "MORE_INFO", note } });
      break;

    case "reject":
      if (app.status === "ACTIVE" || app.status === "REJECTED") return bad("Not allowed now");
      if (!note) return bad("Write a short message for the applicant");
      await prisma.partnerApplication.update({ where: { id: appId }, data: { status: "REJECTED", note } });
      break;

    case "mark_fee_paid":
      if (app.feePaid || app.status === "REJECTED" || app.status === "ACTIVE") return bad("Not allowed now");
      await prisma.partnerApplication.update({
        where: { id: appId },
        data: { feePaid: true, feePaidAt: new Date() },
      });
      break;
  }

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: `Application ${action.replace("_", " ")}`,
      details: `#${appId} · ${app.name}${note ? " · " + note : ""}`,
    },
  });

  try {
    await activateIfReady(appId);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not activate the account" },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}