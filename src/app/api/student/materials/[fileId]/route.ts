import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { getKindSession } from "@/lib/kind-session";
import { getDownloadableFile } from "@/lib/student-learning";
import { storedPath } from "@/lib/lesson-files";

export async function GET(_req: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const session = await getKindSession("student");
  if (!session) return NextResponse.json({ error: "Please log in" }, { status: 401 });

  const student = await prisma.student.findUnique({ where: { id: session.id }, select: { isActive: true } });
  if (!student?.isActive) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  const fileId = Number((await params).fileId);
  if (!Number.isInteger(fileId)) return NextResponse.json({ error: "Invalid file" }, { status: 400 });

  const file = await getDownloadableFile(session.id, fileId);
  if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

  let data: Buffer;
  try {
    data = await readFile(storedPath(file.storedAs));
  } catch {
    return NextResponse.json({ error: "This file is not available right now" }, { status: 404 });
  }

  const inline = file.mimeType === "application/pdf";
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(data.length),
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}