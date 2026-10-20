import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({
  // number = is user ko admin banao, null = admin hata do
  adminId: z.number().int().positive().nullable(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { id: rawId } = await params;
  if (!/^\d+$/.test(rawId)) {
    return NextResponse.json({ error: "Invalid district" }, { status: 400 });
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
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const district = await prisma.district.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!district) return NextResponse.json({ error: "District not found" }, { status: 404 });

  const { adminId } = parsed.data;
  let assignee: { id: number; name: string } | null = null;

  if (adminId !== null) {
    const user = await prisma.user.findUnique({
      where: { id: adminId },
      select: { id: true, name: true, role: true, isActive: true },
    });
    if (!user || user.role !== "DISTRICT_ADMIN") {
      return NextResponse.json({ error: "Choose a user with the District Admin role" }, { status: 400 });
    }
    if (!user.isActive) {
      return NextResponse.json({ error: "This user is inactive" }, { status: 400 });
    }
    assignee = { id: user.id, name: user.name };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Ek admin ek hi district sambhalta hai: pehle uske purane district se hata do
      if (assignee) {
        const others = await tx.district.findMany({
          where: { admin: { id: assignee.id }, NOT: { id } },
          select: { id: true },
        });
        for (const o of others) {
          await tx.district.update({ where: { id: o.id }, data: { admin: { disconnect: true } } });
        }
      }

      await tx.district.update({
        where: { id },
        data: { admin: assignee ? { connect: { id: assignee.id } } : { disconnect: true } },
      });

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: assignee ? "District admin assigned" : "District admin removed",
          details: assignee ? `${district.name} · ${assignee.name}` : district.name,
        },
      });
    });
  } catch (e) {
    console.error("District admin update failed", e);
    return NextResponse.json({ error: "Could not update the district" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}