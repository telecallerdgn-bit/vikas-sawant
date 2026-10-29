"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, GraduationCap, Quote, Star } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import Float from "@/components/site/Float";

export type Testimonial = {
  name: string;
  /** Jaise "Student, Banking Exam" */
  role: string;
  text: string;
  /** Optional photo, jaise "/testimonials/anita.jpg". Khali ho to naam ka pehla akshar dikhega. */
  image?: string;
  /** Optional star rating, 0 se 5 (4.5 jaisa aadha bhi chalega) */
  rating?: number;
  /** Optional chip, jaise "SBI PO batch" */
  course?: string;
};

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative h-5 w-5 shrink-0">
            <Star className="absolute inset-0 h-5 w-5 text-brand-200" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="h-5 w-5 shrink-0 fill-gold-400 text-gold-400" />
            </span>
          </span>
        );
      })}
    </div>
  );
}

const variants = {
  enter: (d: number) => ({ opacity: 0, x: d * 48 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d * -48 }),
};

function Decor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-gold-400/20 blur-3xl" />
      <div className="absolute -right-20 -top-16 h-80 w-80 rounded-full bg-brand-300/30 blur-3xl" />
      <svg className="absolute bottom-0 right-0 hidden h-40 w-48 text-brand-300/50 sm:block" fill="currentColor">
        <defs>
          <pattern id="testi-dots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#testi-dots)" />
      </svg>
      <Quote className="absolute -left-6 top-10 hidden h-40 w-40 -rotate-12 text-brand-300/20 lg:block" strokeWidth={1} />
      <div className="absolute right-[6%] top-1/2 hidden h-6 w-6 md:block">
        <Float className="h-full w-full" distance={8} duration={5}>
          <svg viewBox="0 0 16 16" className="h-full w-full text-gold-400/70" fill="currentColor">
            <path d="M8 0C8 5 11 8 16 8C11 8 8 11 8 16C8 11 5 8 0 8C5 8 8 5 8 0Z" />
          </svg>
        </Float>
      </div>
    </div>
  );
}

export default function Testimonials({ items }: { items: Testimonial[] }) {
  const reduce = useReducedMotion();
  const [state, setState] = useState({ index: 0, dir: 1 });
  const [paused, setPaused] = useState(false);
  const count = items.length;

  const go = useCallback(
    (delta: number) => setState((s) => ({ index: (s.index + delta + count) % count, dir: delta >= 0 ? 1 : -1 })),
    [count],
  );
  const jump = (i: number) => setState((s) => ({ index: i, dir: i >= s.index ? 1 : -1 }));

  useEffect(() => {
    if (count < 2 || paused || reduce) return;
    const t = setInterval(() => go(1), 7000);
    return () => clearInterval(t);
  }, [count, paused, reduce, go]);

  if (count === 0) return null;

  const t = items[state.index];

  const arrowCls =
    "flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand-900 bg-white text-brand-900 shadow-md transition hover:bg-brand-900 hover:text-gold-400 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400";

  const body = (
    <div className="grid items-center gap-6 md:grid-cols-[minmax(0,22rem)_1fr] md:gap-10">
      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-brand-600 md:aspect-square">
        {t.image ? (
          <Image
            src={t.image}
            alt={t.name}
            fill
            sizes="(min-width: 768px) 22rem, 90vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="flex h-28 w-28 items-center justify-center rounded-full bg-gold-400 text-5xl font-bold text-brand-900 ring-8 ring-white/20">
              {t.name.trim().charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Quote */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-4">
          <Quote className="h-9 w-9 fill-gold-400 text-gold-400" />
          {typeof t.rating === "number" && <Stars value={t.rating} />}
        </div>
        <blockquote className="mt-4 text-lg font-semibold leading-relaxed text-brand-900 md:text-xl">
          {t.text}
        </blockquote>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xl font-bold text-brand-900">{t.name}</p>
            <p className="mt-0.5 text-sm text-slate-500">{t.role}</p>
          </div>
          {t.course && (
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-100 px-4 py-2 text-sm font-bold text-brand-900">
              <GraduationCap className="h-4 w-4" /> {t.course}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative overflow-hidden bg-[#EEF3FB] py-20">
      <Decor />

      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-sm font-semibold text-brand-800">
              <Quote className="h-4 w-4" /> Testimonials
            </span>
            <h2 className="mt-5 text-3xl font-bold text-brand-900 md:text-4xl">What our learners say</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">Hear from the students who learn with us.</p>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div
            className="relative mx-auto mt-12 max-w-5xl"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            {/* Peeche ke kagaz jaise layers */}
            {count > 1 && (
              <>
                <div aria-hidden className="absolute inset-0 -rotate-[3deg] rounded-3xl border border-brand-100 bg-white/80 shadow-md md:-left-3 md:top-5" />
                <div aria-hidden className="absolute inset-0 -rotate-[5.5deg] rounded-3xl border border-brand-100 bg-white/60 shadow-sm md:-left-6 md:top-9" />
              </>
            )}

            {/* Main card */}
            <div className="relative overflow-hidden rounded-3xl border border-white bg-white p-5 shadow-2xl shadow-brand-900/10 md:p-8 md:px-14">
              {reduce ? (
                <div key={state.index}>{body}</div>
              ) : (
                <AnimatePresence mode="wait" initial={false} custom={state.dir}>
                  <motion.div
                    key={state.index}
                    custom={state.dir}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {body}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Desktop arrows: card ke kinare par */}
            {count > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous testimonial"
                  onClick={() => go(-1)}
                  className={`${arrowCls} absolute left-0 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:flex`}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next testimonial"
                  onClick={() => go(1)}
                  className={`${arrowCls} absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-1/2 md:flex`}
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </Reveal>

        {/* Dots (+ mobile arrows) */}
        {count > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button type="button" aria-label="Previous testimonial" onClick={() => go(-1)} className={`${arrowCls} !h-10 !w-10 md:hidden`}>
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              {items.map((it, i) => (
                <button
                  key={`${it.name}-${i}`}
                  type="button"
                  onClick={() => jump(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                  aria-current={i === state.index}
                  className={`h-2.5 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 ${
                    i === state.index ? "w-8 bg-gold-400" : "w-2.5 bg-brand-300 hover:bg-brand-400"
                  }`}
                />
              ))}
            </div>
            <button type="button" aria-label="Next testimonial" onClick={() => go(1)} className={`${arrowCls} !h-10 !w-10 md:hidden`}>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}