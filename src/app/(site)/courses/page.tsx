import Link from "next/link";
import { Suspense } from "react";
import { BookOpen, ChevronRight, GraduationCap, PlayCircle, Video, X } from "lucide-react";
import { MODES } from "@/lib/catalog";
import { SITE } from "@/lib/site-config";
import { getActiveCourses, getCourseCategories, type CourseCardData } from "@/lib/site-data";
import { activeFilterCount, hrefWith, parseParams, type CourseParams } from "@/lib/course-query";
import CourseCard from "@/components/site/CourseCard";
import CourseFilters from "@/components/site/CourseFilters";
import CoursesDecor from "@/components/site/CoursesDecor";
import Reveal from "@/components/site/Reveal";
import { CardsSkeleton, EmptyNote } from "@/components/site/ui";

export const metadata = { title: `Courses | ${SITE.brand}` };

type SearchParams = Promise<{ q?: string; category?: string; mode?: string; sort?: string }>;

// Sorting needs the whole list, so the page asks for more courses than it shows by default.
// If the catalogue grows past this, add pagination.
const LIMIT = 200;

// The price a student really pays: the live offer price if there is one, otherwise the starting price.
const payable = (c: CourseCardData) => c.offerFrom ?? c.from;

function sortCourses(list: CourseCardData[], sort: CourseParams["sort"]) {
  if (sort === "name") return [...list].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "price-asc") return [...list].sort((a, b) => payable(a) - payable(b));
  if (sort === "price-desc") return [...list].sort((a, b) => payable(b) - payable(a));
  return list; // "new": the database already returned newest first
}

function Chip({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-label={`Remove filter ${label}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-gold-400 bg-gold-100/60 px-3.5 py-1.5 text-xs font-bold text-brand-900 transition hover:bg-gold-100 active:scale-95"
    >
      {label}
      <X className="h-3.5 w-3.5 text-brand-700" />
    </Link>
  );
}

async function Listing({ searchParams }: { searchParams: SearchParams }) {
  const params = parseParams(await searchParams);

  const [categories, courses] = await Promise.all([
    getCourseCategories(),
    getActiveCourses(LIMIT, params.q || undefined, {
      category: params.category || undefined,
      mode: params.mode || undefined,
    }),
  ]);

  const category = categories.find((c) => c.slug === params.category);
  const unknownCategory = params.category !== "" && !category;
  const modeLabel = MODES.find((m) => m.value === params.mode)?.label;

  const list = sortCourses(courses, params.sort);
  const filtered = activeFilterCount(params) > 0;
  const shown = unknownCategory ? 0 : list.length;

  return (
    <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
      <CourseFilters params={params} categories={categories} canSortPrice />

      <div className="min-w-0">
        {/* Result bar */}
        <div className="mb-6 flex flex-wrap items-center gap-2.5">
          <p className="mr-1 inline-flex items-center gap-2 rounded-full bg-brand-900 px-4 py-1.5 text-sm font-bold text-white shadow-md shadow-brand-900/15">
            <BookOpen className="h-4 w-4 text-gold-400" />
            {shown} course{shown === 1 ? "" : "s"}
          </p>
          {category && <Chip label={category.name} href={hrefWith(params, { category: "" })} />}
          {modeLabel && <Chip label={modeLabel} href={hrefWith(params, { mode: "" })} />}
          {params.q && <Chip label={`"${params.q}"`} href={hrefWith(params, { q: "" })} />}
          {filtered && (
            <Link
              href="/courses"
              className="ml-1 text-xs font-bold text-brand-800 underline decoration-gold-400 decoration-2 underline-offset-4 hover:text-brand-600"
            >
              Clear all
            </Link>
          )}
        </div>

        {unknownCategory ? (
          <EmptyNote title="This category was not found." text="Pick one from the list, or see all courses." />
        ) : list.length === 0 ? (
          <EmptyNote
            title={filtered ? "No courses match these filters." : "Courses are coming soon."}
            text={filtered ? "Try removing a filter or searching a different word." : "Please check back shortly."}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((c, i) => (
              <Reveal key={c.id} delay={(i % 3) * 100} className="h-full">
                <CourseCard course={c} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ListingSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
      <div className="hidden h-96 animate-pulse rounded-3xl border border-brand-100 bg-white lg:block" />
      <CardsSkeleton />
    </div>
  );
}

const HIGHLIGHTS = [
  { icon: Video, label: "Live classes" },
  { icon: PlayCircle, label: "Recorded lessons" },
  { icon: BookOpen, label: "Study material" },
];

export default function CoursesPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="bg-white">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-b from-[#EEF3FB] to-white">
        <CoursesDecor />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-14 pt-12 text-center md:pt-16">
          <Reveal>
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500">
              <Link href="/" className="transition hover:text-brand-900">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-brand-900">Courses</span>
            </nav>

            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-sm font-semibold text-brand-800">
              <GraduationCap className="h-4 w-4" /> Learn online
            </span>
            <h1 className="mt-5 text-4xl font-black text-brand-900 md:text-5xl">All courses</h1>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Pick a category, then open a course to see its modes and prices.
            </p>
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
      </header>

      {/* Filters + courses */}
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-4">
        <Suspense fallback={<ListingSkeleton />}>
          <Listing searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}