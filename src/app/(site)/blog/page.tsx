import Link from "next/link";
import { Suspense } from "react";
import { getPublishedPosts } from "@/lib/site-data";
import BlogCard from "@/components/site/BlogCard";
import { CardsSkeleton, EmptyNote, SectionHead } from "@/components/site/ui";

export const metadata = { title: "Blog | vikas-sawant" };

const PAGE_SIZE = 9;

type SearchParams = Promise<{ page?: string }>;

async function List({ searchParams }: { searchParams: SearchParams }) {
  const page = Math.max(1, Number.parseInt((await searchParams).page ?? "1", 10) || 1);
  const { posts, total } = await getPublishedPosts(PAGE_SIZE, (page - 1) * PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (posts.length === 0) {
    return <EmptyNote title="No articles yet." text="New articles will appear here." />;
  }

  const btn = "rounded-full border border-orange-200 bg-white px-5 py-2 text-sm font-semibold text-[#2b1a5a] hover:bg-orange-50";

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <BlogCard key={p.id} post={p} />
        ))}
      </div>

      {pages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          {page > 1 && (
            <Link href={page - 1 === 1 ? "/blog" : `/blog?page=${page - 1}`} className={btn}>
              Newer
            </Link>
          )}
          <span className="text-sm text-slate-500">
            Page {page} of {pages}
          </span>
          {page < pages && (
            <Link href={`/blog?page=${page + 1}`} className={btn}>
              Older
            </Link>
          )}
        </div>
      )}
    </>
  );
}

export default function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <SectionHead eyebrow="Our blog" title="Articles and updates" />
      <div className="mt-10">
        <Suspense fallback={<CardsSkeleton />}>
          <List searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}