import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Atom,
  Award,
  BookOpen,
  Calculator,
  GraduationCap,
  Library,
  Lightbulb,
  NotebookPen,
  Pencil,
  Ruler,
  UserCheck,
  Users,
} from "lucide-react";
import { SITE } from "@/lib/site-config";
import Reveal from "@/components/site/Reveal";
import Float from "@/components/site/Float";

const POINTS = [
  {
    icon: UserCheck,
    title: "Mentored by Vikas Sawant",
    text: "20 years of experience and 14 competitive exams cleared.",
  },
  {
    icon: GraduationCap,
    title: "Job-ready training",
    text: "Weekend batches, regular tests and free interview guidance.",
  },
];

/* Education-themed vector background. Purely decorative, sits behind the content. */
function EduBackground() {
  const icons = [
    { Icon: BookOpen, cls: "left-[4%] top-10 h-14 w-14 -rotate-12 text-brand-300/40" },
    { Icon: Pencil, cls: "left-[44%] top-8 h-10 w-10 rotate-45 text-gold-500/30" },
    { Icon: Lightbulb, cls: "right-[6%] top-14 h-14 w-14 rotate-12 text-gold-500/30" },
    { Icon: Atom, cls: "right-[3%] top-[45%] hidden h-16 w-16 rotate-6 text-brand-300/40 md:block" },
    { Icon: Calculator, cls: "left-[3%] top-[55%] hidden h-12 w-12 -rotate-6 text-brand-300/40 md:block" },
    { Icon: Ruler, cls: "bottom-10 left-[40%] h-12 w-12 -rotate-12 text-brand-300/40" },
    { Icon: NotebookPen, cls: "bottom-12 right-[8%] h-14 w-14 rotate-6 text-gold-500/30" },
    { Icon: Library, cls: "bottom-8 left-[8%] hidden h-14 w-14 rotate-3 text-gold-500/30 sm:block" },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft blobs */}
      <svg className="absolute -right-24 -top-24 h-96 w-96 text-brand-100" viewBox="0 0 200 200" fill="currentColor">
        <path d="M44.7,-58.4C57.6,-48.6,67.2,-33.8,71.3,-17.4C75.4,-1,74,17.1,65.6,30.7C57.2,44.3,41.8,53.4,25.3,60.4C8.8,67.4,-8.7,72.3,-24.6,68C-40.5,63.7,-54.8,50.2,-63.9,34.2C-73,18.2,-76.9,-0.3,-72.1,-16C-67.3,-31.7,-53.8,-44.6,-39.3,-54C-24.8,-63.4,-9.3,-69.3,3.9,-74.2C17.1,-79.1,31.8,-68.2,44.7,-58.4Z" transform="translate(100 100)" />
      </svg>
      <svg className="absolute -bottom-32 -left-24 h-[26rem] w-[26rem] text-gold-400/10" viewBox="0 0 200 200" fill="currentColor">
        <path d="M39.9,-52.6C51.6,-43.6,60.9,-31.4,64.8,-17.6C68.7,-3.8,67.2,11.6,60.4,23.8C53.6,36,41.5,45,28.5,52.1C15.5,59.2,1.6,64.4,-12.9,63.2C-27.4,62,-42.5,54.4,-52.4,42.4C-62.3,30.4,-67,14,-65.4,-1.1C-63.8,-16.2,-55.9,-30,-45,-39.2C-34.1,-48.4,-20.2,-53,-5.5,-47.6C9.2,-42.2,28.2,-61.6,39.9,-52.6Z" transform="translate(100 100)" />
      </svg>

      {/* Dot grids */}
      <svg className="absolute left-0 top-0 h-40 w-40 text-brand-300/50" fill="currentColor">
        <defs>
          <pattern id="about-dots-a" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#about-dots-a)" />
      </svg>
      <svg className="absolute bottom-0 right-0 hidden h-44 w-44 text-brand-300/50 sm:block" fill="currentColor">
        <defs>
          <pattern id="about-dots-b" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#about-dots-b)" />
      </svg>

      {/* Dashed flight path with a graduation cap on it */}
      <svg
        className="absolute inset-x-0 top-1/2 hidden h-48 w-full -translate-y-1/2 text-brand-300/60 lg:block"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="6 10"
        strokeLinecap="round"
      >
        <path d="M-20 160 C 220 20, 420 200, 640 100 S 1000 10, 1220 80" />
      </svg>

      {/* Scattered education icons */}
      {icons.map(({ Icon, cls }, i) => (
        <div key={i} className={`absolute ${cls}`}>
          <Float className="h-full w-full" delay={i * 0.6} duration={6 + (i % 3) * 1.5}>
            <Icon className="h-full w-full" strokeWidth={1.5} />
          </Float>
        </div>
      ))}
    </div>
  );
}

export default function About() {
  const { image, image2 } = SITE.about;

  return (
    <section className="relative overflow-hidden bg-brand-50">
      <EduBackground />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-14 px-4 py-16 md:grid-cols-2 md:py-20">
        {/* Left: photo, years badge and stat card */}
        <Reveal variant="left" className="relative mx-auto w-full max-w-md pb-10 pl-4 pr-6 md:pl-8 md:pr-10">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-900 shadow-xl">
            {image ? (
              <Image
                src={image}
                alt="Students learning at Vikas Sawants Academy"
                fill
                sizes="(min-width: 768px) 28rem, 90vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gold-300">
                <GraduationCap className="h-24 w-24" />
              </div>
            )}
          </div>

          <Float className="absolute left-0 top-10 flex items-center gap-3 rounded-2xl bg-brand-900 px-5 py-4 text-white shadow-xl" duration={7}>
            <Award className="h-9 w-9 text-gold-400" />
            <div>
              <p className="text-3xl font-black leading-none">15+</p>
              <p className="mt-1 text-sm text-brand-100">years of coaching</p>
            </div>
          </Float>

          <Float className="absolute bottom-0 right-0 w-48 overflow-hidden rounded-3xl bg-white p-2 shadow-2xl sm:w-56" duration={8} delay={1}>
            {image2 && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image src={image2} alt="" fill sizes="14rem" className="object-cover" />
              </div>
            )}
            <div className="flex items-center gap-3 px-2 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-400 text-brand-900">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-black leading-none text-brand-900">6,500+</p>
                <p className="mt-1 text-xs text-slate-500">students in govt jobs</p>
              </div>
            </div>
          </Float>
        </Reveal>

        {/* Right: content */}
        <Reveal variant="right" delay={150}>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-sm font-semibold text-brand-800">
            <BookOpen className="h-4 w-4" /> About us
          </span>
          <h2 className="mt-5 text-3xl font-black leading-tight text-brand-900 md:text-4xl">
            Coaching that makes you job-ready for bank and government exams
          </h2>
          <p className="mt-5 max-w-xl text-slate-600">
            For over 15 years, {SITE.brand} has helped thousands of students secure jobs as bank probationary
            officers and clerks. Our expert faculty, structured study material and online and offline coaching also
            cover SSC, MBA entrance and Railway exams.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {POINTS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-brand-300 bg-white text-brand-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-brand-900">{p.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{p.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="/courses"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-brand-900 px-7 py-3.5 font-bold text-white hover:bg-brand-800"
          >
            View our courses <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}