import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  mobile: z.string().regex(/^[6-9]\d{9}$/),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your email and 10-digit mobile" }, { status: 400 });
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
    return NextResponse.json({ error: "No application found for these details" }, { status: 404 });
  }

  return NextResponse.json({
    name: app.name,
    status: app.status,
    note: app.note,
    feePaid: app.feePaid,
    referralCode: app.status === "ACTIVE" ? app.user?.referralCode ?? null : null,
  });
}