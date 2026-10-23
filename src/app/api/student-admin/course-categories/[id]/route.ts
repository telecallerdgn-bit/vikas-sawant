import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSadminForApi } from "@/lib/sadmin-api";
import { refreshCatalog } from "@/lib/revalidate";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getSadminForApi();
  if (!admin || !admin.isActive) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const category = await prisma.courseCategory.findUnique({ where: { id }, select: { id: true } });
  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

  // Courses in this category are kept; their category becomes empty
  await prisma.courseCategory.delete({ where: { id } });
  refreshCatalog();
  return NextResponse.json({ ok: true });
}