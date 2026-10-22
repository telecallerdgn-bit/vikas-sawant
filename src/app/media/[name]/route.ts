import { readFile } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/uploads";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;

  // Only our own random file names pass, so nobody can read other files with "../".
  const m = /^[a-f0-9]{24}\.(jpg|png|webp)$/.exec(name);
  if (!m) return new Response("Not found", { status: 404 });

  try {
    const buf = await readFile(path.join(UPLOAD_DIR, "courses", name));
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": MIME[m[1]],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}