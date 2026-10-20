import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  mobile: z.string().regex(/^[6-9]\d{9}$/),
});

/* ---- Simple rate limit: ek IP se 5 request per minute ----
   Note: ye memory me rehta hai. Ek server par theek chalta hai; agar kai servers
   ya serverless par deploy karein to Redis/Upstash jaisa shared store use karein. */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const hits = (globalThis as { __statusHits?: Map<string, number[]> }).__statusHits ?? new Map<string, number[]>();
(globalThis as { __statusHits?: Map<string, number[]> }).__statusHits = hits;

function tooMany(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);

  // Memory na badhe isliye kabhi kabhi purani entries saaf karo
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }
  return false;
}

function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...extra } });

export async function POST(req: Request) {
  if (tooMany(clientIp(req))) {
    return json({ error: "Too many attempts. Please try again in a minute." }, 429, { "Retry-After": "60" });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Enter your email and 10-digit mobile" }, 400);
  }

  const app = await prisma.partnerApplication.findFirst({
    where: { email: parsed.data.email, mobile: parsed.data.mobile },
    orderBy: { createdAt: "desc" },
    select: {
      name: true,
      status: true,
      note: true,
      feePaid: true,
      user: { select: { referralCode: true } },
    },
  });

  if (!app) {
    return json({ error: "No application found for these details" }, 404);
  }

  return json({
    name: app.name,
    status: app.status,
    note: app.note,
    feePaid: app.feePaid,
    referralCode: app.status === "ACTIVE" ? app.user?.referralCode ?? null : null,
  });
}