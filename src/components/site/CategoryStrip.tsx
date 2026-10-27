"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Calculator,
  FileText,
  GraduationCap,
  Landmark,
  Languages,
  LayoutGrid,
  Shield,
  TrainFront,
} from "lucide-react";
import type { CategoryData } from "@/lib/site-data";
import Reveal from "@/components/site/Reveal";
import Float from "@/components/site/Float";

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

const GAP = 16; // px, same as gap-4

/* Creative dark background: glows, dot grid, orbit rings, sparkles, curved edges, education icons */
function Decor() {
  const icons = [
    { Icon: Landmark, cls: "left-[5%] top-28 h-14 w-14 -rotate-12" },
    { Icon: TrainFront, cls: "right-[6%] top-24 h-14 w-14 rotate-6" },
    { Icon: Calculator, cls: "left-[9%] bottom-28 h-12 w-12 rotate-6" },
    { Icon: GraduationCap, cls: "right-[8%] bottom-24 h-16 w-16 -rotate-6" },
    { Icon: BookOpen, cls: "left-[46%] top-20 hidden h-10 w-10 rotate-12 md:block" },
  ];
  const sparkles = [
    { cls: "left-[16%] top-36", size: "h-5 w-5", d: 0 },
    { cls: "right-[18%] top-44", size: "h-4 w-4", d: 0.8 },
    { cls: "left-[30%] bottom-32", size: "h-4 w-4", d: 1.4 },
    { cls: "right-[30%] bottom-36", size: "h-6 w-6", d: 0.4 },
    { cls: "right-[44%] top-28", size: "h-3 w-3", d: 1.1 },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft glows */}
      <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-gold-400/15 blur-3xl" />

      {/* Dot grid over the whole band */}
      <svg className="absolute inset-0 h-full w-full text-white/10" fill="currentColor">
        <defs>
          <pattern id="cat-dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cat-dots)" />
      </svg>

      {/* Orbit rings with a gold "planet" */}
      <svg className="absolute -right-24 top-6 h-[30rem] w-[30rem] text-white/15" viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="200" cy="200" r="70" />
        <circle cx="200" cy="200" r="125" />
        <circle cx="200" cy="200" r="180" strokeDasharray="4 9" />
        <circle cx="325" cy="200" r="7" fill="#fbbf24" stroke="none" />
        <circle cx="96" cy="108" r="4" fill="currentColor" stroke="none" />
      </svg>
      <svg className="absolute -bottom-32 -left-28 h-[26rem] w-[26rem] text-white/10" viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="200" cy="200" r="60" />
        <circle cx="200" cy="200" r="115" />
        <circle cx="200" cy="200" r="170" strokeDasharray="4 9" />
        <circle cx="315" cy="200" r="5" fill="currentColor" stroke="none" />
      </svg>

      {/* Sparkles */}
      {sparkles.map((sp, i) => (
        <div key={i} className={`absolute ${sp.cls} ${sp.size}`}>
          <Float className="h-full w-full" delay={sp.d} duration={4 + (i % 3)} distance={8}>
            <svg viewBox="0 0 16 16" className="h-full w-full text-gold-300/70" fill="currentColor">
              <path d="M8 0C8 5 11 8 16 8C11 8 8 11 8 16C8 11 5 8 0 8C5 8 8 5 8 0Z" />
            </svg>
          </Float>
        </div>
      ))}

      {/* Education icons */}
      {icons.map(({ Icon, cls }, i) => (
        <div key={i} className={`absolute text-white/10 ${cls}`}>
          <Float className="h-full w-full" delay={i * 0.6} duration={7 + (i % 3)}>
            <Icon className="h-full w-full" strokeWidth={1.5} />
          </Float>
        </div>
      ))}
    </div>
  );
}

export default function CategoryStrip({ categories }: { categories: CategoryData[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });
  const count = categories.length;

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const step = useCallback(() => {
    const card = trackRef.current?.firstElementChild as HTMLElement | null;
    return card ? card.offsetWidth + GAP : 280;
  }, []);

  const scrollByCard = (dir: 1 | -1) => trackRef.current?.scrollBy({ left: dir * step(), behavior: "smooth" });

  // Mouse drag se scroll (touch par browser ka swipe pehle se chalta hai)
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = trackRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = trackRef.current;
    if (!d.active || !el) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 5) d.moved = true;
    el.scrollLeft = d.startLeft - dx;
  };

  const endDrag = () => {
    const d = drag.current;
    const el = trackRef.current;
    if (!d.active || !el) return;
    d.active = false;
    setDragging(false);
    // Sabse paas wale card par settle karo
    const left = el.getBoundingClientRect().left + 16;
    let best: number | null = null;
    for (const child of Array.from(el.children)) {
      const delta = child.getBoundingClientRect().left - left;
      if (best === null || Math.abs(delta) < Math.abs(best)) best = delta;
    }
    el.scrollBy({ left: best ?? 0, behavior: "smooth" });
  };

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update, count]);

  // Auto-play: har 3.5 sec mein ek card aage, end par wapas shuru
  useEffect(() => {
    if (paused || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: step(), behavior: "smooth" });
    }, 3500);
    return () => clearInterval(t);
  }, [paused, count, step]);

  if (count === 0) return null;

  const arrowCls =
    "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-brand-100 bg-white text-brand-900 shadow-lg transition hover:bg-brand-900 hover:text-gold-400 disabled:pointer-events-none disabled:opacity-0 md:flex";

  return (
    <div className="relative">
      {/* Navy curve section ke upar: jo bhi rang upar hai uske upar baithta hai, safed patti nahi banti */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[calc(100%-1px)] z-10 h-14 w-full text-brand-900"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0,48C220,10 460,70 700,36C920,6 1180,86 1440,32V80H0Z" />
      </svg>

    <section className="relative overflow-hidden bg-brand-900 text-white">
      <Decor />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-24">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-gold-300 backdrop-blur">
              <LayoutGrid className="h-4 w-4" /> Explore
            </span>
            <h2 className="mt-5 text-3xl font-black text-white md:text-4xl">Browse by category</h2>
            <p className="mx-auto mt-3 max-w-2xl text-brand-100">Pick your exam and see all the courses for it.</p>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div
            className="relative mt-10"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setTimeout(() => setPaused(false), 4000)}
          >
            <button type="button" aria-label="Previous categories" disabled={!canPrev} onClick={() => scrollByCard(-1)} className={`${arrowCls} left-1`}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button type="button" aria-label="Next categories" disabled={!canNext} onClick={() => scrollByCard(1)} className={`${arrowCls} right-1`}>
              <ArrowRight className="h-5 w-5" />
            </button>

            <div
              ref={trackRef}
              onScroll={update}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
              onPointerCancel={endDrag}
              onDragStart={(e) => e.preventDefault()}
              onClickCapture={(e) => {
                // Drag ke baad galti se card ka link na khule
                if (drag.current.moved) {
                  e.preventDefault();
                  e.stopPropagation();
                  drag.current.moved = false;
                }
              }}
              className={`-mx-4 flex scroll-pl-4 gap-4 overflow-x-auto px-4 pb-8 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
                dragging ? "cursor-grabbing select-none snap-none scroll-auto" : "cursor-grab snap-x snap-mandatory scroll-smooth"
              }`}
            >
              {categories.map((c, i) => {
                const Icon = iconFor(c.name);
                return (
                  <Link
                    key={c.id}
                    href={`/courses?category=${c.slug}`}
                    className="group relative flex w-60 shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-brand-100 bg-white p-6 shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-2 hover:border-gold-400 hover:shadow-2xl sm:w-64"
                  >
                    {/* Corner blob, hover par bada hota hai */}
                    <span
                      className={`absolute -right-10 -top-10 h-32 w-32 rounded-full transition duration-500 group-hover:scale-150 ${
                        i % 2 ? "bg-brand-100/70" : "bg-gold-100/80"
                      }`}
                    />
                    {/* Bada halka icon card ke peeche */}
                    <Icon className="absolute -bottom-6 -right-6 h-28 w-28 text-brand-50 transition duration-500 group-hover:-rotate-12 group-hover:scale-110 group-hover:text-gold-400/20" />

                    <span className="relative flex h-14 w-14 -rotate-6 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-lg shadow-brand-900/30 ring-4 ring-brand-50 transition duration-300 group-hover:rotate-0 group-hover:ring-gold-400/40">
                      <Icon className="h-7 w-7" />
                    </span>

                    <h3 className="relative mt-5 text-lg font-black leading-snug text-brand-900">{c.name}</h3>

                    <div className="relative mt-4 flex items-center justify-between">
                      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-900">
                        {c.count} {c.count === 1 ? "course" : "courses"}
                      </span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-100 text-brand-900 transition duration-300 group-hover:bg-brand-900 group-hover:text-gold-400">
                        <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </div>

                    {/* Hover par neeche gold line */}
                    <span className="absolute bottom-0 left-1/2 h-1 w-0 -translate-x-1/2 rounded-full bg-gold-400 transition-all duration-300 group-hover:w-2/3" />
                  </Link>
                );
              })}
            </div>
          </div>
        </Reveal>

        <div className="text-center">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-3 text-sm font-bold text-brand-900 shadow-lg shadow-gold-500/20 transition hover:bg-gold-300 active:scale-95"
          >
            All courses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>

      {/* Navy curve section ke neeche */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[calc(100%-1px)] z-10 h-14 w-full text-brand-900"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0,0H1440V32C1180,86 920,6 700,36C460,70 220,10 0,48Z" />
      </svg>
    </div>
  );
}