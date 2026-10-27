"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export type HeroSlide = {
  eyebrow?: string;
  title: string;
  accent?: string;
  text: string;
  /** Path in /public, e.g. "/hero/slide-1.jpg". Khali ho to brand gradient dikhega. */
  image?: string;
  cta?: { label: string; href: string };
  cta2?: { label: string; href: string };
};

const INTERVAL_MS = 6000;

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (count < 2 || paused || reduceMotion) return;
    const t = setInterval(next, INTERVAL_MS);
    return () => clearInterval(t);
  }, [count, paused, reduceMotion, next]);

  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
  }

  return (
    <section
      className="relative overflow-hidden bg-brand-900 text-white"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides: sab ek ke upar ek, active wali fade-in hoti hai */}
      <div className="relative min-h-[34rem] md:min-h-[40rem]">
        {slides.map((s, i) => {
          const active = i === index;
          return (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!active}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                active ? "z-10 opacity-100" : "z-0 opacity-0"
              }`}
            >
              {s.image ? (
                <Image
                  src={s.image}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className={`object-cover ${
                    reduceMotion ? "" : "transition-transform duration-[7000ms] ease-out"
                  } ${active && !reduceMotion ? "scale-110" : "scale-100"}`}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-800 via-brand-900 to-brand-900" />
              )}

              {/* Overlay: left side zyada dark taaki text padhne mein aaye */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-900/90 via-brand-900/60 to-brand-900/20" />

              <div className="relative mx-auto flex h-full min-h-[34rem] max-w-6xl items-center px-4 pb-28 pt-16 md:min-h-[40rem] md:pt-24">
                <motion.div
                  className="max-w-2xl"
                  initial={{ opacity: 0, y: 28 }}
                  animate={active || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
                  transition={{ duration: 0.8, delay: active ? 0.35 : 0, ease: [0.22, 1, 0.36, 1] }}
                >
                  {s.eyebrow && (
                    <p className="text-sm font-bold uppercase tracking-widest text-gold-300">{s.eyebrow}</p>
                  )}
                  <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
                    {s.title}
                    {s.accent && (
                      <>
                        {" "}
                        <span className="italic text-gold-400">{s.accent}</span>
                      </>
                    )}
                  </h1>
                  <p className="mt-5 max-w-lg text-lg text-brand-100">{s.text}</p>

                  {(s.cta || s.cta2) && (
                    <div className="mt-8 flex flex-wrap gap-3">
                      {s.cta && (
                        <Link
                          href={s.cta.href}
                          tabIndex={active ? 0 : -1}
                          className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-3.5 font-bold text-brand-900 shadow-lg shadow-gold-500/30 hover:bg-gold-300"
                        >
                          {s.cta.label} <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                      {s.cta2 && (
                        <Link
                          href={s.cta2.href}
                          tabIndex={active ? 0 : -1}
                          className="rounded-full border-2 border-white/30 px-7 py-3.5 font-bold text-white hover:bg-white/10"
                        >
                          {s.cta2.label}
                        </Link>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          {/* Arrows: right side, vertically centered (jaise reference mein) */}
          <div className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 md:flex lg:right-10">
            <button
              type="button"
              onClick={next}
              aria-label="Next slide"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-white/10 text-white backdrop-blur transition hover:bg-gold-400 hover:text-brand-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-300"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous slide"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-white/10 text-white backdrop-blur transition hover:bg-gold-400 hover:text-brand-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>

          {/* Dots */}
          <div className="absolute inset-x-0 bottom-20 z-20 flex justify-center gap-2 md:justify-start md:pl-[max(1rem,calc((100vw-72rem)/2+1rem))]">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={`h-2.5 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-300 ${
                  i === index ? "w-8 bg-gold-400" : "w-2.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}