import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStudentAdmin } from "@/lib/sadmin-auth";
import BlogForm from "@/components/studentadmin/BlogForm";
import { SAHeader } from "@/components/studentadmin/ui";

async function View({ params }: { params: Promise<{ id: string }> }) {
  await requireStudentAdmin();

  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <BlogForm
      initial={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? "",
        content: post.content,
        coverImage: post.coverImage ?? "",
        status: post.status,
      }}
    />
  );
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="space-y-6">
      <SAHeader title="Edit post" subtitle="Switch the status to Published to make it live." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View params={params} />
      </Suspense>
    </div>
  );
}