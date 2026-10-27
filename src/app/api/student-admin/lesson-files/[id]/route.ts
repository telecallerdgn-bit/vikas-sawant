import { NextResponse } from "next/server";
import { unlink } from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { getSadminForApi } from "@/lib/sadmin-api";
import { storedPath } from "@/lib/lesson-files";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getSadminForApi();
  if (!admin || !admin.isActive) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const row = await prisma.lessonFile.findUnique({ where: { id }, select: { storedAs: true } });
  if (!row) return NextResponse.json({ error: "File not found" }, { status: 404 });

  await prisma.lessonFile.delete({ where: { id } });
  await unlink(storedPath(row.storedAs)).catch(() => {}); // the record is gone either way
  return NextResponse.json({ ok: true });
}