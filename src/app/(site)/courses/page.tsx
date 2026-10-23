import Link from "next/link";
import { Suspense } from "react";
import { Search } from "lucide-react";
import { getActiveCourses } from "@/lib/site-data";
import CourseCard from "@/components/site/CourseCard";
import { CardsSkeleton, EmptyNote, SectionHead } from "@/components/site/ui";

export const metadata = { title: "Courses | vikas-sawant" };

type SearchParams = Promise<{ q?: string }>;

async function List({ searchParams }: { searchParams: SearchParams }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 60);
  const courses = await getActiveCourses(60, q || undefined);

  return (
    <>
      {courses.length === 0 ? (
        <EmptyNote
          title={q ? "No courses match your search." : "Courses are coming soon."}
          text={q ? "Try a different word." : "Please check back shortly."}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
      {q && (
        <p className="mt-6 text-center text-sm">
          <Link href="/courses" className="font-semibold text-orange-600 hover:underline">
            Clear search
          </Link>
        </p>
      )}
    </>
  );
}

export default function CoursesPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <SectionHead eyebrow="Learn online" title="All courses" text="Open a course to see its modes and prices." />

      <form className="relative mx-auto mt-8 max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          name="q"
          placeholder="Search courses"
          className="w-full rounded-full border border-orange-100 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-orange-400"
        />
      </form>

      <div className="mt-10">
        <Suspense fallback={<CardsSkeleton />}>
          <List searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}