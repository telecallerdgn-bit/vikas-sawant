import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import type { CourseCardData } from "@/lib/site-data";
import { rupees } from "@/components/site/ui";

export default function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-900 to-brand-600">
        {course.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.coverImage}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/70">
            <GraduationCap className="h-14 w-14" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand-900">
            {course.modes.length} {course.modes.length === 1 ? "mode" : "modes"}
          </span>
          {course.offerFrom !== null && (
            <span className="rounded-full bg-gold-400 px-3 py-1 text-xs font-bold text-brand-900">
              {course.offerLabel || "Special offer"}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-brand-900">{course.name}</h3>
        {course.summary && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{course.summary}</p>}

        <div className="mt-auto flex items-center justify-between pt-5">
          {course.offerFrom !== null ? (
            <p className="flex items-baseline gap-2 text-sm text-slate-500">
              <span className="text-lg font-black text-brand-700">{rupees.format(course.offerFrom)}</span>
              <span className="text-xs text-slate-400 line-through">{rupees.format(course.from)}</span>
            </p>
          ) : (
            <p className="text-sm text-slate-500">
              From <span className="text-lg font-black text-brand-700">{rupees.format(course.from)}</span>
            </p>
          )}
          <span className="flex items-center gap-1 text-sm font-bold text-brand-900 group-hover:text-brand-600">
            View <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}