import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const roles = ["STUDENT", "PARTNER", "DISTRICT_ADMIN", "SUB_SUPER", "FINANCE", "PACKING", "ADMIN"] as const;

const updateSchema = z.object({
  role: z.enum(roles).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  // Admin should not lock themselves out
  if (userId === session.userId) {
    return NextResponse.json({ error: "You cannot change your own role or status" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
    select: { id: true, name: true, email: true, mobile: true, role: true, isActive: true },
  });

  return NextResponse.json(user);
}