import Link from "next/link";
import { ArrowRight, ArrowUpRight, GraduationCap, Layers } from "lucide-react";
import type { CourseCardData } from "@/lib/site-data";
import { rupees } from "@/components/site/ui";

export default function CourseCard({ course }: { course: CourseCardData }) {
  const modeCount = course.modes.length;
  const modeLabel = `${modeCount} ${modeCount === 1 ? "mode" : "modes"}`;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:border-gold-400 hover:shadow-2xl"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-900 to-brand-600">
        {course.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.coverImage}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="relative flex h-full items-center justify-center text-white/60">
            <svg aria-hidden className="absolute inset-0 h-full w-full text-white/10" fill="currentColor">
              <defs>
                <pattern id="card-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#card-dots)" />
            </svg>
            <GraduationCap className="relative h-16 w-16" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Tags */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-md">
            <Layers className="h-3.5 w-3.5 text-gold-400" /> {modeLabel}
          </span>
          {course.offerFrom !== null && (
            <span className="rounded-full bg-gold-400 px-3.5 py-1.5 text-xs font-bold text-brand-900 shadow-md">
              {course.offerLabel || "Special offer"}
            </span>
          )}
        </div>

        {/* Corner arrow */}
        <span className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-brand-900 shadow-md transition duration-300 group-hover:bg-gold-400">
          <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>

      {/* Content panel: image ke upar curve ke saath chadha hua */}
      <div className="relative -mt-6 flex flex-1 flex-col overflow-hidden rounded-t-3xl bg-white px-5 pb-5 pt-6">
        {/* Bada halka icon peeche */}
        <GraduationCap className="pointer-events-none absolute -bottom-6 -right-6 h-32 w-32 text-brand-50 transition duration-500 group-hover:-rotate-12 group-hover:text-gold-400/15" />

        {/* Price */}
        <div className="relative">
          {course.offerFrom !== null ? (
            <p className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gold-600">{rupees.format(course.offerFrom)}</span>
              <span className="text-sm font-semibold text-slate-400 line-through">{rupees.format(course.from)}</span>
            </p>
          ) : (
            <p className="flex items-baseline gap-1.5">
              <span className="text-xs font-semibold text-slate-500">From</span>
              <span className="text-xl font-bold text-gold-600">{rupees.format(course.from)}</span>
            </p>
          )}
        </div>

        <h3 className="relative mt-3 text-lg font-bold leading-snug text-brand-900">{course.name}</h3>
        <span className="relative mt-2 block h-1 w-10 rounded-full bg-gold-400 transition-all duration-300 group-hover:w-24" />

        {course.summary && <p className="relative mt-3 line-clamp-2 text-sm text-slate-600">{course.summary}</p>}

        {/* Meta */}
        <div className="relative mt-5 flex items-center gap-2 border-t border-brand-100 pt-4 text-sm text-slate-500">
          <Layers className="h-4 w-4 text-brand-600" />
          <span>
            {modeCount} learning {modeCount === 1 ? "mode" : "modes"} to choose from
          </span>
        </div>

        {/* Button */}
        <div className="relative mt-auto pt-5">
          <span className="flex items-center justify-center gap-2 rounded-2xl bg-brand-900 px-5 py-3 text-sm font-bold text-white transition duration-300 group-hover:bg-gold-400 group-hover:text-brand-900">
            View course <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}