import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import Reveal from "@/components/site/Reveal";
import Float from "@/components/site/Float";

const EXAMS = ["Banking (IBPS, SBI, RBI)", "MPSC / UPSC", "MBA (CAT / CMAT)", "SSC", "Railway", "Vedic Maths"];

/* A grid cell. It lets a card span more columns and still animate in with Reveal. */
function Cell({
  className = "",
  delay = 0,
  children,
}: {
  className?: string;
  delay?: number;
  children: ReactNode;
}) {
  return (
    <div className={`[&>*]:h-full ${className}`}>
      <Reveal delay={delay}>{children}</Reveal>
    </div>
  );
}

/* The six small cards share one design. */
function Card({
  n,
  tag,
  title,
  text,
  icon: Icon,
}: {
  n: string;
  tag: string;
  title: string;
  text: string;
  icon: LucideIcon;
}) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-brand-100 bg-white p-6 shadow-sm transition duration-300 hover:border-gold-400 hover:shadow-xl motion-safe:hover:-translate-y-2">
      {/* Big faint number, turns gold on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-1 -top-3 select-none text-7xl font-black leading-none text-brand-50 transition duration-500 group-hover:text-gold-100"
      >
        {n}
      </span>
      {/* Faint icon behind the card */}
      <Icon
        aria-hidden
        className="pointer-events-none absolute -bottom-6 -right-6 h-28 w-28 text-brand-50 transition duration-500 group-hover:-rotate-12 group-hover:scale-110 group-hover:text-gold-400/20"
      />

      <span className="relative flex h-14 w-14 -rotate-6 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 text-gold-400 shadow-lg shadow-brand-900/25 ring-4 ring-brand-50 transition duration-300 group-hover:rotate-0 group-hover:ring-gold-400/40">
        <Icon className="h-7 w-7" />
      </span>

      <span className="relative mt-5 inline-block w-fit rounded-full bg-gold-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold-800">
        {tag}
      </span>
      <h3 className="relative mt-3 text-xl font-black leading-snug text-brand-900">{title}</h3>
      <p className="relative mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>

      {/* Gold line that grows on hover */}
      <span
        aria-hidden
        className="absolute bottom-0 left-1/2 h-1 w-0 -translate-x-1/2 rounded-full bg-gold-400 transition-all duration-300 group-hover:w-2/3"
      />
    </article>
  );
}

export default function OfferSection() {
  return (
    <section className="relative overflow-hidden bg-brand-50 py-20">
      {/* Background: soft glows, dot grid, sparkles */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-gold-400/15 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />
        <svg className="absolute inset-0 h-full w-full text-brand-900/10" fill="currentColor">
          <defs>
            <pattern id="offer-dots" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#offer-dots)" />
        </svg>
        <div className="absolute right-[12%] top-14 h-6 w-6">
          <Float className="h-full w-full" delay={0.4} duration={5} distance={8}>
            <svg viewBox="0 0 16 16" className="h-full w-full text-gold-400" fill="currentColor">
              <path d="M8 0C8 5 11 8 16 8C11 8 8 11 8 16C8 11 5 8 0 8C5 8 8 5 8 0Z" />
            </svg>
          </Float>
        </div>
        <div className="absolute left-[8%] top-1/2 h-4 w-4">
          <Float className="h-full w-full" delay={1.2} duration={6} distance={8}>
            <svg viewBox="0 0 16 16" className="h-full w-full text-gold-400/80" fill="currentColor">
              <path d="M8 0C8 5 11 8 16 8C11 8 8 11 8 16C8 11 5 8 0 8C5 8 8 5 8 0Z" />
            </svg>
          </Float>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-sm font-semibold text-brand-900 shadow-sm">
              <Sparkles className="h-4 w-4 text-gold-600" /> Why students choose us
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-brand-900 md:text-5xl">
              What we <span className="relative inline-block">
                offer
                <span aria-hidden className="absolute -bottom-1 left-0 -z-10 h-3 w-full rounded-full bg-gold-400/70" />
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Everything you need to prepare, practise and get job-ready, all in one place.
            </p>
          </div>
        </Reveal>

        {/* Bento grid: the sizes change so the section never looks like a plain list */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* 01: the big navy card */}
          <Cell className="sm:col-span-2" delay={0}>
            <article className="group relative flex h-full min-h-[20rem] flex-col justify-between overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 p-8 text-white shadow-xl shadow-brand-900/25 md:p-10">
              <span
                aria-hidden
                className="pointer-events-none absolute -right-4 -top-10 select-none text-[11rem] font-black leading-none text-white/[0.06]"
              >
                01
              </span>
              <svg
                aria-hidden
                className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 text-white/15"
                viewBox="0 0 400 400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="200" cy="200" r="70" />
                <circle cx="200" cy="200" r="125" />
                <circle cx="200" cy="200" r="180" strokeDasharray="4 9" />
                <circle cx="325" cy="200" r="7" fill="#feb906" stroke="none" />
              </svg>
              <div aria-hidden className="pointer-events-none absolute bottom-6 right-8 h-24 w-24 text-white/10">
                <Float className="h-full w-full" delay={0.3} duration={7} distance={10}>
                  <Users className="h-full w-full" strokeWidth={1.4} />
                </Float>
              </div>

              <div className="relative">
                <span className="flex h-16 w-16 -rotate-6 items-center justify-center rounded-2xl bg-gold-400 text-brand-900 shadow-lg shadow-black/25 transition duration-300 group-hover:rotate-0">
                  <Users className="h-8 w-8" />
                </span>
                <span className="mt-6 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold-300">
                  Teaching
                </span>
                <h3 className="mt-3 text-3xl font-black md:text-4xl">Expert faculty</h3>
                <p className="mt-2 max-w-md text-brand-100">Experienced teachers who guide every student.</p>
              </div>

              <div className="relative mt-8 flex flex-wrap gap-2">
                {["Banking", "SSC", "MBA", "Railway", "MPSC / UPSC"].map((x) => (
                  <span
                    key={x}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white"
                  >
                    {x}
                  </span>
                ))}
              </div>
            </article>
          </Cell>

          {/* 02 to 05: white cards */}
          <Cell delay={120}>
            <Card
              n="02"
              tag="Material"
              icon={BookOpen}
              title="Structured study material"
              text="Well planned notes and books for every exam."
            />
          </Cell>
          <Cell delay={0}>
            <Card
              n="03"
              tag="Classes"
              icon={GraduationCap}
              title="Online and offline coaching"
              text="Result-oriented classes in the mode you prefer."
            />
          </Cell>
          <Cell delay={120}>
            <Card
              n="04"
              tag="Flexible"
              icon={CalendarDays}
              title="Weekend batches"
              text="Learn on weekends without missing your routine."
            />
          </Cell>
          <Cell delay={240}>
            <Card
              n="05"
              tag="Practice"
              icon={ClipboardList}
              title="Regular tests"
              text="Practise often and track your progress."
            />
          </Cell>

          {/* 06: wide gold card with a button */}
          <Cell className="sm:col-span-2 lg:col-span-3" delay={100}>
            <article className="group relative flex h-full flex-col items-start gap-6 overflow-hidden rounded-[2rem] bg-gradient-to-r from-gold-400 via-gold-300 to-gold-200 p-8 text-brand-900 shadow-xl shadow-gold-500/25 md:flex-row md:items-center md:justify-between md:p-10">
              <MessageCircle
                aria-hidden
                className="pointer-events-none absolute -bottom-10 right-40 hidden h-52 w-52 text-brand-900/10 transition duration-500 group-hover:-rotate-6 group-hover:scale-110 md:block"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -left-3 -top-8 select-none text-[9rem] font-black leading-none text-brand-900/[0.07]"
              >
                06
              </span>

              <div className="relative flex items-start gap-5">
                <span className="flex h-16 w-16 shrink-0 -rotate-6 items-center justify-center rounded-2xl bg-brand-900 text-gold-400 shadow-lg shadow-brand-900/30 transition duration-300 group-hover:rotate-0">
                  <MessageCircle className="h-8 w-8" />
                </span>
                <div>
                  <span className="inline-block rounded-full bg-brand-900 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold-300">
                    Free for every student
                  </span>
                  <h3 className="mt-2 text-2xl font-black md:text-3xl">Free interview guidance</h3>
                  <p className="mt-1 max-w-md font-medium text-brand-800">Be job-ready for the final round.</p>
                </div>
              </div>

              <Link
                href="/contact"
                className="relative inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-900 px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-brand-800 active:scale-95"
              >
                Talk to our team <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          </Cell>
        </div>

        {/* Exams strip */}
        <Reveal delay={150}>
          <div className="mt-12 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Exams we prepare you for</p>
            <ul className="mt-4 flex flex-wrap justify-center gap-2.5">
              {EXAMS.map((e) => (
                <li
                  key={e}
                  className="rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-900 shadow-sm transition hover:border-gold-400 hover:bg-gold-50"
                >
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}