"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Building2, MapPin } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import Float from "@/components/site/Float";

export type DistrictItem = {
  name: string;
  slug: string;
  centres: number;
  /** Optional photo, jaise "/districts/pune.jpg". Khali ho to gradient dikhega. */
  image?: string;
};

const GAP = 24; // px, same as gap-6

// Card ke top-right corner mein gol "bite" jahan arrow button baithta hai
const BITE = "radial-gradient(circle at calc(100% - 2.25rem) 2.25rem, transparent 3.25rem, #000 calc(3.25rem + 0.5px))";

function Decor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="absolute -left-28 -top-24 h-[24rem] w-[24rem] text-brand-100/60" viewBox="0 0 200 200" fill="currentColor">
        <path d="M44.7,-58.4C57.6,-48.6,67.2,-33.8,71.3,-17.4C75.4,-1,74,17.1,65.6,30.7C57.2,44.3,41.8,53.4,25.3,60.4C8.8,67.4,-8.7,72.3,-24.6,68C-40.5,63.7,-54.8,50.2,-63.9,34.2C-73,18.2,-76.9,-0.3,-72.1,-16C-67.3,-31.7,-53.8,-44.6,-39.3,-54C-24.8,-63.4,-9.3,-69.3,3.9,-74.2C17.1,-79.1,31.8,-68.2,44.7,-58.4Z" transform="translate(100 100)" />
      </svg>
      <svg className="absolute bottom-0 right-0 hidden h-40 w-48 text-brand-300/40 sm:block" fill="currentColor">
        <defs>
          <pattern id="district-dots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#district-dots)" />
      </svg>
      <div className="absolute right-[6%] top-14 h-12 w-12 rotate-6 text-brand-300/25">
        <Float className="h-full w-full" duration={7}>
          <MapPin className="h-full w-full" strokeWidth={1.5} />
        </Float>
      </div>
      <div className="absolute bottom-16 left-[5%] hidden h-12 w-12 -rotate-6 text-gold-500/25 sm:block">
        <Float className="h-full w-full" delay={1} duration={8}>
          <Building2 className="h-full w-full" strokeWidth={1.5} />
        </Float>
      </div>
    </div>
  );
}

export default function DistrictExplorer({
  districts,
  basePath = "/district",
}: {
  districts: DistrictItem[];
  /** Card click par `${basePath}/${slug}` khulega */
  basePath?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });
  const count = districts.length;

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const step = useCallback(() => {
    const card = trackRef.current?.firstElementChild as HTMLElement | null;
    return card ? card.offsetWidth + GAP : 300;
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
    <section className="relative overflow-hidden bg-white">
      <Decor />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-sm font-semibold text-brand-800">
              <MapPin className="h-4 w-4" /> Our centres
            </span>
            <h2 className="mt-5 text-3xl font-bold text-brand-900 md:text-4xl">Explore by district</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">Explore VSA Centres in your preferred district.</p>
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
            <button type="button" aria-label="Previous districts" disabled={!canPrev} onClick={() => scrollByCard(-1)} className={`${arrowCls} left-1`}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button type="button" aria-label="Next districts" disabled={!canNext} onClick={() => scrollByCard(1)} className={`${arrowCls} right-1`}>
              <ArrowRight className="h-5 w-5" />
            </button>

            {/* Ek hi row, side mein scroll hoti hai */}
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
              className={`-mx-4 flex scroll-pl-4 gap-6 overflow-x-auto px-4 pb-10 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
                dragging ? "cursor-grabbing select-none snap-none scroll-auto" : "cursor-grab snap-x snap-mandatory scroll-smooth"
              }`}
            >
              {districts.map((d) => (
                <Link
                  key={d.slug}
                  href={`${basePath}/${d.slug}`}
                  className="group relative block w-[85%] shrink-0 snap-start drop-shadow-sm transition duration-300 hover:-translate-y-1.5 hover:drop-shadow-2xl sm:w-[calc((100%_-_1.5rem)/2)] lg:w-[calc((100%_-_3rem)/3)]"
                >
                  {/* Card body: top-right corner gol kata hua */}
                  <div
                    className="h-full rounded-3xl bg-brand-50 p-5 transition duration-300 group-hover:bg-gold-100/60"
                    style={{ WebkitMaskImage: BITE, maskImage: BITE }}
                  >
                    <h3 className="pr-20 text-xl font-bold leading-snug text-brand-900">{d.name}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                      <Building2 className="h-4 w-4 text-brand-600" />
                      {d.centres} {d.centres === 1 ? "Centre" : "Centres"}
                    </p>

                    <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-brand-600">
                      {d.image ? (
                        <Image
                          src={d.image}
                          alt={`${d.name} centre`}
                          fill
                          sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 85vw"
                          draggable={false}
                          className="object-cover transition duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-white/30">
                          <svg aria-hidden className="absolute inset-0 h-full w-full text-white/10" fill="currentColor">
                            <defs>
                              <pattern id="district-card-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1.4" />
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#district-card-dots)" />
                          </svg>
                          <MapPin className="relative h-20 w-20 transition duration-500 group-hover:scale-110" strokeWidth={1.25} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arrow button gol kate hue hisse mein */}
                  <span className="absolute right-1 top-1 flex h-16 w-16 items-center justify-center rounded-full bg-brand-900 text-white shadow-lg transition duration-300 group-hover:bg-gold-400 group-hover:text-brand-900">
                    <ArrowUpRight className="h-6 w-6 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}