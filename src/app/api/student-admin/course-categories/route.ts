import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/catalog";
import { getSadminForApi } from "@/lib/sadmin-api";
import { refreshCatalog } from "@/lib/revalidate";

const schema = z.object({ name: z.string().trim().min(2, "Enter the category name").max(120) });

export async function POST(req: Request) {
  const admin = await getSadminForApi();
  if (!admin || !admin.isActive) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const name = parsed.data.name;
  const slug = slugify(name).slice(0, 140);
  if (!slug) return NextResponse.json({ error: "Use letters or numbers in the name" }, { status: 400 });

  try {
    const position = await prisma.courseCategory.count();
    const category = await prisma.courseCategory.create({
      data: { name, slug, position },
      select: { id: true, name: true },
    });
    refreshCatalog();
    return NextResponse.json(category, { status: 201 });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "This category already exists" }, { status: 409 });
    }
    throw e;
  }
}