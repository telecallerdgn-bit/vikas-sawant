import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({
  districtId: z.number().int().positive().nullable(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
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
    return NextResponse.json({ error: "Choose a valid district" }, { status: 400 });
  }
  const { districtId } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Only a PARTNER can be moved. Other roles are never changed here.
      const partner = await tx.user.findFirst({
        where: { id, role: "PARTNER" },
        select: { id: true, name: true, district: { select: { name: true } } },
      });
      if (!partner) return { status: 404, error: "Partner not found" } as const;

      let nextName = "No district";
      if (districtId !== null) {
        const district = await tx.district.findUnique({ where: { id: districtId }, select: { name: true } });
        if (!district) return { status: 404, error: "District not found" } as const;
        nextName = district.name;
      }

      await tx.user.update({ where: { id }, data: { districtId } });
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "Partner district changed",
          details: `${partner.name} · ${partner.district?.name ?? "No district"} → ${nextName}`,
        },
      });
      return { ok: true } as const;
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Partner district update failed", e);
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
  }
}