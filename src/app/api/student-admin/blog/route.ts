import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogSchema } from "@/lib/content-schema";
import { getSadminForApi } from "@/lib/sadmin-api";
import { refreshBlog } from "@/lib/revalidate";

export async function POST(req: Request) {
  const admin = await getSadminForApi();
  if (!admin || !admin.isActive) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  const parsed = blogSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const d = parsed.data;

  if (d.status === "PUBLISHED" && d.content.trim().length < 20) {
    return NextResponse.json({ error: "Write the post before publishing it" }, { status: 400 });
  }

  try {
    const post = await prisma.blogPost.create({
      data: {
        title: d.title,
        slug: d.slug,
        excerpt: d.excerpt || null,
        content: d.content,
        coverImage: d.coverImage || null,
        status: d.status,
        publishedAt: d.status === "PUBLISHED" ? new Date() : null,
        authorName: admin.name,
      },
      select: { id: true },
    });

    refreshBlog();
    return NextResponse.json({ id: post.id }, { status: 201 });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "This link name is already used by another post" }, { status: 409 });
    }
    throw e;
  }
}