import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";

const TOPICS = ["Course enquiry", "Order or delivery help", "Become a partner", "Something else"] as const;

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(120),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number")
    .optional()
    .or(z.literal("")),
  topic: z.enum(TOPICS),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(1000),
  website: z.string().optional(), // chhupa hua spam field
});

/* ---- Simple rate limit: ek IP se 10 minute me 3 message ----
   Note: ye memory me rehta hai. Kai servers ya serverless par shared store (Redis) use karein. */
const WINDOW_MS = 10 * 60_000;
const MAX_REQUESTS = 3;
const hits = (globalThis as { __contactHits?: Map<string, number[]> }).__contactHits ?? new Map<string, number[]>();
(globalThis as { __contactHits?: Map<string, number[]> }).__contactHits = hits;

function tooMany(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return false;
}

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...extra } });

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(ip)) {
    return json({ error: "Too many messages. Please try again in a few minutes." }, 429, { "Retry-After": "600" });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, 400);
  }
  const d = parsed.data;

  // Bot ne chhupa field bhara hai: chupchap "ok" bol do, par kuch save mat karo
  if (d.website && d.website.trim() !== "") return json({ ok: true });

  let row: { id: number };
  try {
    row = await prisma.contactMessage.create({
      data: {
        name: d.name,
        email: d.email,
        mobile: d.mobile ? d.mobile : null,
        topic: d.topic,
        message: d.message,
      },
      select: { id: true },
    });
  } catch (e) {
    console.error("Contact message could not be saved", e);
    return json({ error: "Could not send your message. Please try again." }, 500);
  }

  // Support team ko chhota sa alert (poora message database me save hai). notify() kabhi throw nahi karta.
  const support = process.env.SUPPORT_EMAIL?.trim();
  await notify({
    channel: "EMAIL",
    recipientName: "Support team",
    recipient: support || "support-email-not-set",
    message: `Contact form · ${d.name} (${d.topic}) ${d.email}${d.mobile ? ` ${d.mobile}` : ""}: ${d.message}`.slice(0, 185),
    event: "CONTACT_FORM",
    refType: "contact",
    refId: row.id,
  });

  return json({ ok: true });
}