import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { getSadminForApi } from "@/lib/sadmin-api";
import { allow } from "@/lib/rate-limit";
import { ALLOWED, MAX_BYTES, MAX_FILES_PER_LESSON, STORAGE_DIR, looksValid, storedPath } from "@/lib/lesson-files";

class LimitError extends Error {}

function parseId(raw: unknown): number | null {
  if (typeof raw !== "string" || !/^\d{1,9}$/.test(raw)) return null;
  const n = Number(raw);
  return n > 0 ? n : null;
}

// Keeps only a safe display name. The stored file never uses this name.
function cleanName(original: string, ext: string) {
  const base = path
    .basename(original)
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f<>:"/\\|?*]/g, "")
    .trim()
    .slice(0, 200);
  return base && base !== ext ? base : `file${ext}`;
}

export async function GET(req: Request) {
  const admin = await getSadminForApi();
  if (!admin) return NextResponse.json({ error: "Not allowed" }, { status: 401 });

  const lessonId = parseId(new URL(req.url).searchParams.get("lessonId"));
  if (lessonId === null) return NextResponse.json({ error: "Invalid lesson" }, { status: 400 });

  const files = await prisma.lessonFile.findMany({
    where: { lessonId },
    orderBy: { id: "asc" },
    // The stored file name is never sent to the browser.
    select: { id: true, name: true, sizeBytes: true },
  });
  return NextResponse.json({ files });
}

export async function POST(req: Request) {
  const admin = await getSadminForApi();
  if (!admin) return NextResponse.json({ error: "Not allowed" }, { status: 401 });

  if (!(await allow(`lesson-file:${admin.id}`, 60, 10 * 60 * 1000))) {
    return NextResponse.json({ error: "Too many uploads. Please wait a few minutes." }, { status: 429 });
  }

  // Refuse very large requests before reading them into memory.
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BYTES + 200_000) {
    return NextResponse.json({ error: "File must be under 10 MB" }, { status: 413 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const lessonId = parseId(form?.get("lessonId"));
  if (!(file instanceof File) || lessonId === null) {
    return NextResponse.json({ error: "Choose a file to upload" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  const mime = Object.hasOwn(ALLOWED, ext) ? ALLOWED[ext] : undefined;
  if (!mime) return NextResponse.json({ error: "Only PDF, DOCX, PPTX or XLSX files are allowed" }, { status: 400 });
  if (file.size === 0) return NextResponse.json({ error: "This file is empty" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File must be under 10 MB" }, { status: 400 });

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true, title: true } });
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const buf = Buffer.from(await file.arrayBuffer());
  if (!looksValid(ext, buf)) {
    return NextResponse.json(
      { error: `This file looks damaged or is not a real ${ext.slice(1).toUpperCase()}` },
      { status: 400 },
    );
  }

  const storedAs = `${randomUUID()}${ext}`;
  const name = cleanName(file.name, ext);

  try {
    await mkdir(STORAGE_DIR, { recursive: true });
    await writeFile(storedPath(storedAs), buf);

    // The limit check and the insert happen together.
    const row = await prisma.$transaction(async (tx) => {
      const count = await tx.lessonFile.count({ where: { lessonId } });
      if (count >= MAX_FILES_PER_LESSON) throw new LimitError();
      return tx.lessonFile.create({
        data: { lessonId, name, storedAs, mimeType: mime, sizeBytes: buf.length },
        select: { id: true, name: true, sizeBytes: true },
      });
    });

    // A failed log entry must never fail an upload that already worked.
    await prisma.auditLog
      .create({
        data: {
          action: "Lesson file uploaded",
          details: `Lesson #${lesson.id} · ${name} · ${buf.length} bytes · by ${admin.email}`.slice(0, 500),
        },
      })
      .catch(() => {});

    return NextResponse.json({ file: row }, { status: 201 });
  } catch (e) {
    // Remove the file from disk when the database step did not finish.
    await unlink(storedPath(storedAs)).catch(() => {});
    if (e instanceof LimitError) {
      return NextResponse.json({ error: `A lesson can have up to ${MAX_FILES_PER_LESSON} files` }, { status: 400 });
    }
    console.error("Lesson file upload failed", e);
    return NextResponse.json({ error: "Could not save the file. Please try again." }, { status: 500 });
  }
}