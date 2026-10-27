import Link from "next/link";
import { Suspense } from "react";
import {
  BookOpen,
  ChevronRight,
  Lightbulb,
  Newspaper,
  PenLine,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { SITE } from "@/lib/site-config";
import { getPublishedPosts } from "@/lib/site-data";
import BlogCard from "@/components/site/BlogCard";
import Reveal from "@/components/site/Reveal";
import { CardsSkeleton, EmptyNote, Wave } from "@/components/site/ui";

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

const HIGHLIGHTS = [
  { icon: Lightbulb, label: "Exam tips" },
  { icon: BookOpen, label: "Study guides" },
  { icon: TrendingUp, label: "Latest updates" },
];

// Small dots drawn with CSS, same pattern as the footer band.
const DOTS = {
  backgroundImage: "radial-gradient(rgba(255,255,255,0.14) 1.5px, transparent 1.5px)",
  backgroundSize: "22px 22px",
};

export default function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="bg-white">
      {/* Header: same dark blue gradient as the footer band and the courses page */}
      <header className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 text-white">
        {/* dot pattern */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={DOTS} />

        {/* soft glows */}
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-gold-400/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 right-16 h-96 w-96 rounded-full bg-gold-400/15 blur-3xl" />

        {/* rings */}
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[28px] border-white/5" />
        <div aria-hidden className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full border-[18px] border-gold-400/10" />

        {/* floating icons */}
        <Newspaper aria-hidden className="pointer-events-none absolute left-[7%] top-12 h-14 w-14 -rotate-12 text-gold-400/25" />
        <PenLine aria-hidden className="pointer-events-none absolute bottom-24 left-[30%] h-11 w-11 rotate-6 text-white/15" />
        <Lightbulb aria-hidden className="pointer-events-none absolute right-[9%] top-10 h-12 w-12 rotate-12 text-gold-300/30" />
        <BookOpen aria-hidden className="pointer-events-none absolute bottom-24 right-[26%] h-12 w-12 -rotate-6 text-white/15" />
        <Sparkles aria-hidden className="pointer-events-none absolute left-[26%] top-10 h-8 w-8 text-gold-400/40" />
        <Sparkles aria-hidden className="pointer-events-none absolute bottom-28 right-[7%] h-7 w-7 text-gold-300/40" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-12 text-center md:pb-28 md:pt-16">
          <Reveal>
            <nav
              aria-label="Breadcrumb"
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur"
            >
              <Link href="/" className="text-white/80 transition hover:text-gold-300">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-gold-400" />
              <span aria-current="page" className="font-bold text-gold-400">
                Blog
              </span>
            </nav>

            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white">
                <Newspaper className="h-4 w-4 text-gold-400" /> Our blog
              </span>
              <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">Articles and updates</h1>
              <p className="mx-auto mt-3 max-w-2xl text-slate-200">
                Exam tips, study guides and the latest news to help you prepare better.
              </p>
            </div>
          </Reveal>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {HIGHLIGHTS.map((h, i) => {
              const Icon = h.icon;
              return (
                <Reveal key={h.label} delay={150 + i * 100}>
                  <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-4 py-2 text-sm font-semibold text-brand-900 shadow-sm">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-400 text-brand-900">
                      <Icon className="h-4 w-4" />
                    </span>
                    {h.label}
                  </span>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* wave into the white page below */}
        <Wave className="absolute inset-x-0 bottom-0 text-white" />
      </header>

      {/* Articles */}
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-6">
        <Suspense fallback={<CardsSkeleton />}>
          <List searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}