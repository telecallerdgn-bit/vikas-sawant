import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma, ApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { activateIfReady } from "@/lib/applications";
import { notifyApplication, type AppEvent } from "@/lib/notify";

const schema = z.object({
  action: z.enum(["review", "approve", "more_info", "reject", "mark_fee_paid"]),
  note: z.string().trim().min(5, "Write a short message for the applicant").max(500).optional(),
});
type Action = z.infer<typeof schema>["action"];

const OPEN: ApplicationStatus[] = ["SUBMITTED", "UNDER_REVIEW", "MORE_INFO"];

class StateError extends Error {}

type Plan = {
  // Conditions that must still be true at the moment of the update.
  where: Prisma.PartnerApplicationWhereInput;
  data: Prisma.PartnerApplicationUpdateManyMutationInput;
  event: AppEvent | null;
  error: string;
  needsNote?: boolean;
};

function buildPlan(action: Action, note: string | undefined): Plan {
  switch (action) {
    case "review":
      return {
        where: { status: "SUBMITTED" },
        data: { status: "UNDER_REVIEW" },
        event: null,
        error: "Only a new application can be moved to review",
      };
    case "approve":
      return {
        where: { status: { in: OPEN } },
        data: { status: "APPROVED", note: null },
        event: "approved",
        error: "This application cannot be approved now",
      };
    case "more_info":
      return {
        where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
        data: { status: "MORE_INFO", note },
        event: "more_info",
        error: "Not allowed now",
        needsNote: true,
      };
    case "reject":
      return {
        where: { status: { notIn: ["ACTIVE", "REJECTED"] } },
        data: { status: "REJECTED", note },
        event: "rejected",
        error: "Not allowed now",
        needsNote: true,
      };
    case "mark_fee_paid":
      return {
        where: { feePaid: false, status: { notIn: ["REJECTED", "ACTIVE"] } },
        data: { feePaid: true, feePaidAt: new Date() },
        event: "fee_paid",
        error: "Not allowed now",
      };
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const appId = Number(id);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const { action, note } = parsed.data;

  const app = await prisma.partnerApplication.findUnique({
    where: { id: appId },
    select: { id: true, name: true },
  });
  if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  const plan = buildPlan(action, note);
  if (plan.needsNote && !note) {
    return NextResponse.json({ error: "Write a short message for the applicant" }, { status: 400 });
  }

  // The status change and its audit entry succeed or fail together.
  // The status condition is part of the update, so two admins cannot both win a race.
  try {
    await prisma.$transaction(async (tx) => {
      const res = await tx.partnerApplication.updateMany({
        where: { id: appId, ...plan.where },
        data: plan.data,
      });
      if (res.count === 0) throw new StateError(plan.error);

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: `Application ${action.replaceAll("_", " ")}`,
          details: `#${appId} · ${app.name}${plan.needsNote && note ? " · " + note : ""}`,
        },
      });
    });
  } catch (e) {
    if (e instanceof StateError) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    console.error("Application update failed", e);
    return NextResponse.json({ error: "Could not update the application" }, { status: 500 });
  }

  // Activation can only become possible after approval or after the fee is marked paid.
  let activated: Awaited<ReturnType<typeof activateIfReady>> | null = null;
  let activationError: string | null = null;
  if (action === "approve" || action === "mark_fee_paid") {
    try {
      activated = await activateIfReady(appId);
    } catch (e) {
      activationError = e instanceof Error ? e.message : "Could not activate the account";
    }
  }

  // A notification problem must never fail a request whose database changes already succeeded.
  try {
    if (activated) await notifyApplication(appId, "activated");
    else if (plan.event) await notifyApplication(appId, plan.event);
  } catch (e) {
    console.error("Notification failed", e);
  }

  if (activationError) {
    await prisma.auditLog
      .create({
        data: {
          userId: session.userId,
          action: "Application activation failed",
          details: `#${appId} · ${app.name} · ${activationError}`,
        },
      })
      .catch(() => {});
    return NextResponse.json(
      { error: `Saved, but the account could not be activated: ${activationError}` },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}