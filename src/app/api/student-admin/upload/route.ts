import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKindSession } from "@/lib/kind-session";
import { allow } from "@/lib/rate-limit";
import { UPLOAD_DIR } from "@/lib/uploads";

const MAX_BYTES = 2 * 1024 * 1024;

// The file type is decided from the real bytes, never from the file name or the browser's claim.
function detect(buf: Buffer): "jpg" | "png" | "webp" | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") {
    return "webp";
  }
  return null;
}

export async function POST(req: Request) {
  // Only a signed-in, active Student Admin can upload.
  const s = await getKindSession("sadmin");
  if (!s) return NextResponse.json({ error: "Not allowed" }, { status: 401 });

  const me = await prisma.studentAdmin.findUnique({
    where: { id: s.id },
    select: { isActive: true },
  });
  if (!me?.isActive) return NextResponse.json({ error: "Not allowed" }, { status: 401 });

  if (!(await allow(`upload:${s.id}`, 30, 10 * 60 * 1000))) {
    return NextResponse.json({ error: "Too many uploads. Please wait a few minutes." }, { status: 429 });
  }

  if (Number(req.headers.get("content-length") ?? 0) > MAX_BYTES + 100_000) {
    return NextResponse.json({ error: "Image must be under 2 MB" }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image" }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 2 MB" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = detect(buf);
  if (!ext) {
    return NextResponse.json({ error: "Only JPG, PNG or WebP images are allowed" }, { status: 400 });
  }

  // A random name, so nobody can guess or overwrite another file.
  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  const dir = path.join(UPLOAD_DIR, "courses");

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), buf);
  } catch (e) {
    console.error("Image upload failed", e);
    return NextResponse.json({ error: "Could not save the image" }, { status: 500 });
  }

  return NextResponse.json({ url: `/media/${name}` }, { status: 201 });
}