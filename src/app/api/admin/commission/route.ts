import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { validateRule, type RuleValues } from "@/lib/commission-calc";

const pct = z.number().min(0).max(100);

const saveSchema = z.object({
  action: z.literal("save"),
  levels: z.array(pct).length(5),
  district: pct,
  subSuper: pct,
  subSuperBase: z.enum(["REMAINDER", "DISTRIBUTABLE"]),
  inactive: z.enum(["SKIP_TO_SUPER_ADMIN", "COMPRESS"]),
  gateway: z.enum(["DEDUCT_FIRST", "SUPER_ADMIN_BEARS"]),
  gstPercent: z.number().min(0).max(50),
  gatewayFeePercent: z.number().min(0).max(10),
  note: z.string().trim().max(200).optional(),
});

const approveSchema = z.object({
  action: z.literal("approve"),
  version: z.number().int().positive(),
});

const schema = z.discriminatedUnion("action", [saveSchema, approveSchema]);

const r2 = (n: number) => Math.round(n * 100) / 100;
const json = (body: unknown, status = 200) => NextResponse.json(body, { status });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return json({ error: "Not allowed" }, 403);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return json({ error: "Invalid data" }, 400);
  const body = parsed.data;

  /* ---------- Naya version save ---------- */
  if (body.action === "save") {
    const rule: RuleValues = {
      levels: body.levels.map(r2),
      district: r2(body.district),
      subSuper: r2(body.subSuper),
      subSuperBase: body.subSuperBase,
      inactive: body.inactive,
      gateway: body.gateway,
      gstPercent: r2(body.gstPercent),
      gatewayFeePercent: r2(body.gatewayFeePercent),
    };
    const problem = validateRule(rule);
    if (problem) return json({ error: problem }, 400);

    try {
      const created = await prisma.$transaction(async (tx) => {
        const last = await tx.commissionRuleVersion.findFirst({
          orderBy: { version: "desc" },
          select: { version: true },
        });
        const version = (last?.version ?? 0) + 1;

        const row = await tx.commissionRuleVersion.create({
          data: {
            version,
            level1Percent: rule.levels[0],
            level2Percent: rule.levels[1],
            level3Percent: rule.levels[2],
            level4Percent: rule.levels[3],
            level5Percent: rule.levels[4],
            districtPercent: rule.district,
            subSuperPercent: rule.subSuper,
            subSuperBase: rule.subSuperBase,
            inactiveRule: rule.inactive,
            gatewayMode: rule.gateway,
            gstPercent: rule.gstPercent,
            gatewayFeePercent: rule.gatewayFeePercent,
            note: body.note ? body.note : null,
            createdById: session.userId,
          },
          select: { version: true },
        });

        await tx.auditLog.create({
          data: {
            userId: session.userId,
            action: "Commission rule saved",
            details: `v${row.version} · levels ${rule.levels.join("/")} · district ${rule.district} · sub super ${rule.subSuper}`,
          },
        });
        return row;
      });
      return json({ ok: true, version: created.version });
    } catch (e) {
      if ((e as { code?: string }).code === "P2002") {
        return json({ error: "Someone else saved a version at the same time. Please refresh and try again." }, 409);
      }
      console.error("Commission rule save failed", e);
      return json({ error: "Could not save the rule" }, 500);
    }
  }

  /* ---------- Current version ko owner-approved karna ---------- */
  try {
    const latest = await prisma.commissionRuleVersion.findFirst({ orderBy: { version: "desc" } });
    if (!latest) return json({ error: "There is no rule to approve yet" }, 400);
    if (latest.version !== body.version) {
      return json({ error: "A newer version exists. Please refresh the page." }, 409);
    }
    if (latest.approvedAt) return json({ error: "This version is already approved" }, 409);

    await prisma.$transaction([
      prisma.commissionRuleVersion.update({
        where: { id: latest.id },
        data: { approvedAt: new Date(), approvedById: session.userId },
      }),
      prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "Commission rule approved",
          details: `v${latest.version}`,
        },
      }),
    ]);
    return json({ ok: true });
  } catch (e) {
    console.error("Commission rule approve failed", e);
    return json({ error: "Could not approve the rule" }, 500);
  }
}