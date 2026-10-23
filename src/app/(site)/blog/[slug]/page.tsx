import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SITE } from "@/lib/site-config";
import { getPostBySlug } from "@/lib/site-data";
import Markdown from "@/components/site/Markdown";
import { dateLong } from "@/components/site/ui";

async function View({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> All articles
      </Link>

      <h1 className="mt-4 text-3xl font-black leading-tight text-[#2b1a5a] md:text-5xl">{post.title}</h1>
      <p className="mt-3 text-sm text-slate-500">
        {post.publishedAt ? `${dateLong.format(post.publishedAt)} · ` : ""}
        By {SITE.brand}
      </p>

      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt=""
          referrerPolicy="no-referrer"
          className="mt-8 aspect-[16/9] w-full rounded-3xl border border-orange-100 object-cover"
        />
      )}

      <div className="mt-8 rounded-3xl border border-orange-100 bg-white p-7 md:p-10">
        <Markdown text={post.content} />
      </div>
    </article>
  );
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-20"><div className="h-72 animate-pulse rounded-3xl bg-orange-100/60" /></div>}>
      <View params={params} />
    </Suspense>
  );
}