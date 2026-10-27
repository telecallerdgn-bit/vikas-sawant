import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { BookOpen, ChevronRight, GraduationCap, Lightbulb, Pencil } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import Float from "@/components/site/Float";
import { Wave } from "@/components/site/ui";

export type Crumb = { label: string; href?: string };

/** Sab pages ka same breadcrumb pill. Aakhri item current page hota hai. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-2 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur"
    >
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <span key={`${c.label}-${i}`} className="inline-flex items-center gap-2">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gold-400" />}
            {last || !c.href ? (
              <span aria-current={last ? "page" : undefined} className="font-bold text-gold-400">
                {c.label}
              </span>
            ) : (
              <Link href={c.href} className="text-white/80 transition hover:text-gold-300">
                {c.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

const SPARKLE = "M8 0C8 5 11 8 16 8C11 8 8 11 8 16C8 11 5 8 0 8C5 8 8 5 8 0Z";

// Chhote dots, CSS se
const DOTS = {
  backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 1.5px, transparent 1.5px)",
  backgroundSize: "24px 24px",
};

// Icon ki jagah: [class, extra]
const SLOTS = [
  "left-[6%] top-12 h-14 w-14 -rotate-12 text-gold-400/25",
  "right-[8%] top-10 h-12 w-12 rotate-12 text-gold-300/30",
  "left-[27%] bottom-24 hidden h-11 w-11 rotate-6 text-white/15 md:block",
  "right-[25%] bottom-24 hidden h-12 w-12 -rotate-6 text-white/15 md:block",
];

/**
 * Blog, Courses, Contact jaise sab pages ka common header:
 * breadcrumb + badge + title + text + (optional chips) + normal creative background.
 */
export default function PageHeader({
  crumbs,
  badge,
  title,
  text,
  highlights,
  decor = [GraduationCap, Lightbulb, BookOpen, Pencil],
}: {
  crumbs: Crumb[];
  badge: { icon: LucideIcon; label: string };
  title: string;
  text: string;
  highlights?: { icon: LucideIcon; label: string }[];
  /** Background ke 4 icons (kam ya zyada diye to bhi chalega) */
  decor?: LucideIcon[];
}): ReactNode {
  const BadgeIcon = badge.icon;

  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 text-white">
      {/* Background vectors */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0" style={DOTS} />
        <div className="absolute -left-24 -top-28 h-80 w-80 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="absolute -bottom-40 right-16 h-96 w-96 rounded-full bg-gold-400/15 blur-3xl" />

        <svg
          className="absolute -right-24 -top-20 h-[24rem] w-[24rem] text-white/10"
          viewBox="0 0 400 400"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="200" cy="200" r="70" />
          <circle cx="200" cy="200" r="125" />
          <circle cx="200" cy="200" r="180" strokeDasharray="4 9" />
          <circle cx="325" cy="200" r="7" fill="#fbbf24" stroke="none" />
        </svg>

        {decor.slice(0, SLOTS.length).map((Icon, i) => (
          <div key={i} className={`absolute ${SLOTS[i]}`}>
            <Float className="h-full w-full" delay={i * 0.6} duration={6 + (i % 3)}>
              <Icon className="h-full w-full" strokeWidth={1.5} />
            </Float>
          </div>
        ))}

        <div className="absolute left-[44%] top-9 hidden h-5 w-5 md:block">
          <Float className="h-full w-full" distance={8} duration={5}>
            <svg viewBox="0 0 16 16" className="h-full w-full text-gold-400/50" fill="currentColor">
              <path d={SPARKLE} />
            </svg>
          </Float>
        </div>
        <div className="absolute bottom-28 right-[7%] hidden h-4 w-4 md:block">
          <Float className="h-full w-full" distance={8} duration={6} delay={1}>
            <svg viewBox="0 0 16 16" className="h-full w-full text-gold-300/50" fill="currentColor">
              <path d={SPARKLE} />
            </svg>
          </Float>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-12 text-center md:pb-28 md:pt-16">
        <Reveal>
          <Breadcrumb items={crumbs} />

          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white">
              <BadgeIcon className="h-4 w-4 text-gold-400" /> {badge.label}
            </span>
            <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">{title}</h1>
            <p className="mx-auto mt-3 max-w-2xl text-slate-200">{text}</p>
          </div>
        </Reveal>

        {highlights && highlights.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {highlights.map((h, i) => {
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
        )}
      </div>

      {/* Neeche safed page mein wave */}
      <Wave className="absolute inset-x-0 bottom-0 text-white" />
    </header>
  );
}