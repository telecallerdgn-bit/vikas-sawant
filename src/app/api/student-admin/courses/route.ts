import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/lib/content-schema";
import { getSadminForApi } from "@/lib/sadmin-api";
import { refreshCatalog } from "@/lib/revalidate";

export async function POST(req: Request) {
  const admin = await getSadminForApi();
  if (!admin || !admin.isActive) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  const parsed = courseSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const d = parsed.data;

  if (d.categoryId !== null) {
    const cat = await prisma.courseCategory.findUnique({ where: { id: d.categoryId }, select: { id: true } });
    if (!cat) return NextResponse.json({ error: "Selected category no longer exists" }, { status: 400 });
  }

  // The older single mode and price columns are kept filled with the cheapest option
  const cheapest = [...d.prices].sort((a, b) => a.price - b.price)[0];

  if (d.offerPrice !== null && d.offerPrice >= cheapest.price) {
    return NextResponse.json({ error: "Offer price must be lower than the normal price" }, { status: 400 });
  }

  try {
    const course = await prisma.course.create({
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
        mode: cheapest.mode,
        price: cheapest.price,
        prices: { create: d.prices },
      },
      select: { id: true },
    });

    refreshCatalog();
    return NextResponse.json({ id: course.id }, { status: 201 });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "This link name is already used by another course" }, { status: 409 });
    }
    throw e;
  }
}