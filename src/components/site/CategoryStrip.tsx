import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Calculator,
  FileText,
  GraduationCap,
  Landmark,
  Languages,
  Shield,
  TrainFront,
} from "lucide-react";
import type { CategoryData } from "@/lib/site-data";

// The icon is picked from words in the category name. Anything else gets the book icon.
const ICONS: { match: RegExp; icon: LucideIcon }[] = [
  { match: /bank|ibps|sbi|rbi/i, icon: Landmark },
  { match: /mba|cat|cmat|mat|management|entrance/i, icon: GraduationCap },
  { match: /ssc|cgl|chsl/i, icon: FileText },
  { match: /rail|rrb|ntpc/i, icon: TrainFront },
  { match: /police|defen[cs]e|army|nda|force/i, icon: Shield },
  { match: /maths?|vedic|account|tally|gst/i, icon: Calculator },
  { match: /english|language|spoken/i, icon: Languages },
  { match: /job|career|teacher|training|marketing/i, icon: Briefcase },
];

function iconFor(name: string): LucideIcon {
  return ICONS.find((i) => i.match.test(name))?.icon ?? BookOpen;
}

export default function CategoryStrip({ categories }: { categories: CategoryData[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-gold-600">Explore</p>
          <h2 className="mt-1 text-3xl font-black text-brand-900 md:text-4xl">Browse by category</h2>
          <p className="mt-2 text-slate-600">Pick your exam and see all the courses for it.</p>
        </div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-5 py-2.5 text-sm font-bold text-brand-800 transition hover:bg-brand-50"
        >
          All courses <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="-mx-4 mt-8 flex snap-x gap-4 overflow-x-auto px-4 pb-4">
        {categories.map((c) => {
          const Icon = iconFor(c.name);
          return (
            <Link
              key={c.id}
              href={`/courses?category=${c.slug}`}
              className="group relative w-64 shrink-0 snap-start overflow-hidden rounded-3xl border border-brand-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl"
            >
              <span className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gold-100/80 transition duration-300 group-hover:scale-125" />

              <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-lg shadow-brand-900/30">
                <Icon className="h-7 w-7" />
              </span>

              <h3 className="relative mt-5 text-lg font-black leading-snug text-brand-900">{c.name}</h3>

              <div className="relative mt-3 flex items-center justify-between">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-900">
                  {c.count} {c.count === 1 ? "course" : "courses"}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-100 text-brand-900 transition group-hover:bg-gold-400">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}