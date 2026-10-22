import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/lib/content-schema";
import { getSadminForApi } from "@/lib/sadmin-api";
import { refreshCatalog } from "@/lib/revalidate";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("toggle"), isActive: z.boolean() }),
  courseSchema.extend({ action: z.literal("save") }),
]);

async function context(params: Promise<{ id: string }>) {
  const admin = await getSadminForApi();
  if (!admin || !admin.isActive) {
    return { error: NextResponse.json({ error: "Not allowed" }, { status: 403 }) } as const;
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return { error: NextResponse.json({ error: "Invalid id" }, { status: 400 }) } as const;
  }
  return { id } as const;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await context(params);
  if ("error" in ctx) return ctx.error;
  const { id } = ctx;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const d = parsed.data;

  const existing = await prisma.course.findUnique({ where: { id }, select: { name: true } });
  if (!existing) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  if (d.action === "toggle") {
    await prisma.course.update({ where: { id }, data: { isActive: d.isActive } });
    refreshCatalog();
    return NextResponse.json({ ok: true });
  }

  if (d.categoryId !== null) {
    const cat = await prisma.courseCategory.findUnique({ where: { id: d.categoryId }, select: { id: true } });
    if (!cat) return NextResponse.json({ error: "Selected category no longer exists" }, { status: 400 });
  }

  if (d.offerPrice !== null && d.offerPrice >= d.prices[0].price) {
    return NextResponse.json({ error: "Offer price must be lower than the normal price" }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.course.update({
        where: { id },
        data: {
          name: d.name,
          slug: d.slug,
          summary: d.summary || null,
          description: d.description || null,
          coverImage: d.coverImage || null,
          isActive: d.isActive,
          categoryId: d.categoryId,
          overview: d.overview || null,
          eligibility: d.eligibility || null,
          keyBenefits: d.keyBenefits || null,
          offerPrice: d.offerPrice,
          offerLabel: d.offerPrice !== null ? d.offerLabel || null : null,
          offerEndsAt:
            d.offerPrice !== null && d.offerEndsAt ? new Date(`${d.offerEndsAt}T23:59:59+05:30`) : null,
        },
      });

      // Modes that were unticked lose their price, the rest are updated or added
      await tx.coursePrice.deleteMany({
        where: { courseId: id, mode: { notIn: d.prices.map((p) => p.mode) } },
      });
      for (const p of d.prices) {
        await tx.coursePrice.upsert({
          where: { courseId_mode: { courseId: id, mode: p.mode } },
          create: { courseId: id, mode: p.mode, price: p.price },
          update: { price: p.price },
        });
      }
    });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "This link name is already used by another course" }, { status: 409 });
    }
    throw e;
  }

  refreshCatalog();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await context(params);
  if ("error" in ctx) return ctx.error;
  const { id } = ctx;

  const course = await prisma.course.findUnique({ where: { id }, select: { name: true } });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  if ((await prisma.order.count({ where: { courseId: id } })) > 0) {
    return NextResponse.json(
      { error: "This course has orders, so it cannot be deleted. Deactivate it instead." },
      { status: 409 }
    );
  }

  await prisma.course.delete({ where: { id } });
  refreshCatalog();
  return NextResponse.json({ ok: true });
}