import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Layers,
  LayoutGrid,
  PlayCircle,
  Radio,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Type,
  Video,
} from "lucide-react";
import { MODES } from "@/lib/catalog";
import { SORTS, activeFilterCount, hrefWith, type CourseParams } from "@/lib/course-query";
import type { CategoryData } from "@/lib/site-data";

const MODE_ICON: Record<string, LucideIcon> = {
  ONLINE_PRERECORDED: PlayCircle,
  LIVE_STUDY: Video,
  STUDY_ONLY: BookOpen,
  HYBRID: Layers,
  LIVE_ONLY: Radio,
};

const SORT_ICON: Record<string, LucideIcon> = {
  new: Sparkles,
  "price-asc": TrendingUp,
  "price-desc": TrendingDown,
  name: Type,
};

function Row({
  href,
  active,
  count,
  icon: Icon,
  children,
}: {
  href: string;
  active: boolean;
  count?: number;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={`group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition duration-200 ${
        active
          ? "bg-brand-900 font-bold text-white shadow-md shadow-brand-900/20"
          : "text-slate-700 hover:translate-x-0.5 hover:bg-brand-50 hover:text-brand-900"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        {active ? (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-400 text-brand-900">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        ) : Icon ? (
          <Icon className="h-4 w-4 shrink-0 text-brand-400 transition group-hover:text-brand-700" />
        ) : (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-200 transition group-hover:bg-gold-400" />
        )}
        <span className="truncate">{children}</span>
      </span>
      {count !== undefined && (
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
            active ? "bg-white/15 text-white" : "bg-brand-50 text-brand-800 group-hover:bg-white"
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

function Heading({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 px-1 text-xs font-black uppercase tracking-widest text-brand-900">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-100 text-brand-900">
        <Icon className="h-3.5 w-3.5" />
      </span>
      {children}
      <span className="h-px flex-1 bg-brand-100" />
    </h2>
  );
}

function Panel({
  params,
  categories,
  canSortPrice,
}: {
  params: CourseParams;
  categories: CategoryData[];
  canSortPrice: boolean;
}) {
  const sorts = SORTS.filter((s) => canSortPrice || !s.value.startsWith("price"));

  return (
    <div className="space-y-7">
      {/* The search keeps the other filters through hidden fields. */}
      <form action="/courses" method="get" role="search" className="relative">
        {params.category && <input type="hidden" name="category" value={params.category} />}
        {params.mode && <input type="hidden" name="mode" value={params.mode} />}
        {params.sort !== "new" && <input type="hidden" name="sort" value={params.sort} />}
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-600" />
        <input
          name="q"
          defaultValue={params.q}
          maxLength={60}
          placeholder="Search courses"
          aria-label="Search courses"
          className="w-full rounded-full border border-brand-100 bg-brand-50/60 py-3 pl-11 pr-14 text-sm text-brand-900 outline-none transition placeholder:text-slate-400 focus:border-gold-400 focus:bg-white focus:ring-4 focus:ring-gold-400/20"
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand-900 text-white transition hover:bg-gold-400 hover:text-brand-900 active:scale-95"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <section>
        <Heading icon={LayoutGrid}>Category</Heading>
        <nav aria-label="Categories" className="space-y-0.5">
          <Row href={hrefWith(params, { category: "" })} active={!params.category}>
            All courses
          </Row>
          {categories.map((c) => (
            <Row key={c.id} href={hrefWith(params, { category: c.slug })} active={params.category === c.slug} count={c.count}>
              {c.name}
            </Row>
          ))}
        </nav>
      </section>

      <section>
        <Heading icon={Layers}>Delivery mode</Heading>
        <nav aria-label="Delivery modes" className="space-y-0.5">
          <Row href={hrefWith(params, { mode: "" })} active={!params.mode}>
            All modes
          </Row>
          {MODES.map((m) => (
            <Row key={m.value} href={hrefWith(params, { mode: m.value })} active={params.mode === m.value} icon={MODE_ICON[m.value]}>
              {m.label}
            </Row>
          ))}
        </nav>
      </section>

      <section>
        <Heading icon={SlidersHorizontal}>Sort by</Heading>
        <nav aria-label="Sort order" className="space-y-0.5">
          {sorts.map((s) => (
            <Row key={s.value} href={hrefWith(params, { sort: s.value })} active={params.sort === s.value} icon={SORT_ICON[s.value]}>
              {s.label}
            </Row>
          ))}
        </nav>
      </section>
    </div>
  );
}

export default function CourseFilters({
  params,
  categories,
  canSortPrice,
}: {
  params: CourseParams;
  categories: CategoryData[];
  canSortPrice: boolean;
}) {
  const active = activeFilterCount(params);

  return (
    <>
      {/* Phone and tablet: a native, no-JavaScript "Filters" box */}
      <details className="group overflow-hidden rounded-3xl border border-white bg-white shadow-xl shadow-brand-900/10 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-bold text-brand-900 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400 text-brand-900">
              <SlidersHorizontal className="h-4 w-4" />
            </span>
            Filters
            {active > 0 && (
              <span className="rounded-full bg-brand-900 px-2.5 py-0.5 text-xs font-bold text-gold-400">{active}</span>
            )}
          </span>
          <ChevronDown className="h-5 w-5 text-slate-400 transition duration-300 group-open:rotate-180" />
        </summary>
        <div className="border-t border-brand-100 p-5">
          <Panel params={params} categories={categories} canSortPrice={canSortPrice} />
        </div>
      </details>

      {/* Desktop: sidebar that stays in view while scrolling */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 overflow-hidden rounded-3xl border border-white bg-white shadow-xl shadow-brand-900/10">
          <div className="h-1.5 bg-gradient-to-r from-gold-400 via-gold-300 to-brand-300" />
          <div className="p-5">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-3 text-lg font-black text-brand-900">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-900 text-gold-400 shadow-md shadow-brand-900/20">
                  <SlidersHorizontal className="h-5 w-5" />
                </span>
                Filters
              </h2>
              {active > 0 && (
                <Link
                  href="/courses"
                  className="flex items-center gap-1.5 rounded-full bg-gold-100 px-3 py-1 text-xs font-bold text-brand-900 transition hover:bg-gold-400 active:scale-95"
                >
                  Reset
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-900 text-[10px] text-gold-400">
                    {active}
                  </span>
                </Link>
              )}
            </div>
            <Panel params={params} categories={categories} canSortPrice={canSortPrice} />
          </div>
        </div>
      </aside>
    </>
  );
}