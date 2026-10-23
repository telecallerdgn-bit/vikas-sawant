import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogSchema } from "@/lib/content-schema";
import { getSadminForApi } from "@/lib/sadmin-api";
import { refreshBlog } from "@/lib/revalidate";

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

  const parsed = blogSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const d = parsed.data;

  const existing = await prisma.blogPost.findUnique({ where: { id }, select: { publishedAt: true } });
  if (!existing) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  if (d.status === "PUBLISHED" && d.content.trim().length < 20) {
    return NextResponse.json({ error: "Write the post before publishing it" }, { status: 400 });
  }

  try {
    await prisma.blogPost.update({
      where: { id },
      data: {
        title: d.title,
        slug: d.slug,
        excerpt: d.excerpt || null,
        content: d.content,
        coverImage: d.coverImage || null,
        status: d.status,
        // The first publish date is kept even if the post is unpublished and published again
        publishedAt: d.status === "PUBLISHED" && !existing.publishedAt ? new Date() : undefined,
      },
    });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "This link name is already used by another post" }, { status: 409 });
    }
    throw e;
  }

  refreshBlog();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await context(params);
  if ("error" in ctx) return ctx.error;
  const { id } = ctx;

  const post = await prisma.blogPost.findUnique({ where: { id }, select: { title: true } });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  await prisma.blogPost.delete({ where: { id } });
  refreshBlog();
  return NextResponse.json({ ok: true });
}