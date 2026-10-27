import Link from "next/link";
import { Suspense } from "react";
import { BookOpen, Lightbulb, Newspaper, PenLine, TrendingUp } from "lucide-react";
import { SITE } from "@/lib/site-config";
import { getPublishedPosts } from "@/lib/site-data";
import BlogCard from "@/components/site/BlogCard";
import PageHeader from "@/components/site/PageHeader";
import Reveal from "@/components/site/Reveal";
import { CardsSkeleton, EmptyNote } from "@/components/site/ui";

export const metadata = { title: `Blog | ${SITE.brand}` };

const PAGE_SIZE = 9;

type SearchParams = Promise<{ page?: string }>;

async function List({ searchParams }: { searchParams: SearchParams }) {
  const page = Math.max(1, Number.parseInt((await searchParams).page ?? "1", 10) || 1);
  const { posts, total } = await getPublishedPosts(PAGE_SIZE, (page - 1) * PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (posts.length === 0) {
    return <EmptyNote title="No articles yet." text="New articles will appear here." />;
  }

  const btn =
    "rounded-full border border-brand-200 bg-white px-5 py-2 text-sm font-semibold text-brand-900 transition hover:border-gold-400 hover:bg-gold-100";

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 110} className="h-full">
            <BlogCard post={p} />
          </Reveal>
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

const HIGHLIGHTS = [
  { icon: Lightbulb, label: "Exam tips" },
  { icon: BookOpen, label: "Study guides" },
  { icon: TrendingUp, label: "Latest updates" },
];

export default function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="bg-white">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
        badge={{ icon: Newspaper, label: "Our blog" }}
        title="Articles and updates"
        text="Exam tips, study guides and the latest news to help you prepare better."
        highlights={HIGHLIGHTS}
        decor={[Newspaper, Lightbulb, PenLine, BookOpen]}
      />

      {/* Articles */}
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-6">
        <Suspense fallback={<CardsSkeleton />}>
          <List searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}