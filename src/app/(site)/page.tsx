import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  GraduationCap,
  Handshake,
  Layers,
  Newspaper,
  PlayCircle,
  Radio,
  Share2,
  UserPlus,
  Video,
  ListChecks,
} from "lucide-react";
import type { CourseMode } from "@prisma/client";
import { MODES } from "@/lib/catalog";
import { SITE } from "@/lib/site-config";
import { getActiveCourses, getCourseCategories, getPublishedPosts } from "@/lib/site-data";
import CourseCard from "@/components/site/CourseCard";
import BlogCard from "@/components/site/BlogCard";
import CategoryStrip from "@/components/site/CategoryStrip";
import HeroSlider from "@/components/site/HeroSlider";
import About from "@/components/site/About";
import Reveal from "@/components/site/Reveal";
import Float from "@/components/site/Float";
import ModesDecor from "@/components/site/ModesDecor";
import CoursesDecor from "@/components/site/CoursesDecor";
import DistrictExplorer from "@/components/site/DistrictExplorer";
import { CardsSkeleton, EmptyNote, Wave } from "@/components/site/ui";

export const metadata = { title: `${SITE.brand} | ${SITE.tagline}` };

const MODE_ICON: Record<CourseMode, LucideIcon> = {
  ONLINE_PRERECORDED: PlayCircle,
  LIVE_STUDY: Video,
  STUDY_ONLY: BookOpen,
  HYBRID: Layers,
  LIVE_ONLY: Radio,
};

function Hero() {
  return (
    <div className="relative">
      <HeroSlider slides={SITE.hero.slides} />
      <Wave className="absolute inset-x-0 bottom-0 z-20 text-brand-50" />
    </div>
  );
}

function Modes() {
  return (
    <section className="relative overflow-hidden bg-brand-50/50">
      <ModesDecor />
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-32 pt-20 md:pb-40">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-sm font-semibold text-brand-800">
              <Layers className="h-4 w-4" /> Learn your way
            </span>
            <h2 className="mt-5 text-3xl font-black text-brand-900 md:text-4xl">Pick the mode that fits you</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              The same course, offered in different ways. Choose what matches your time and budget.
            </p>
          </div>
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {MODES.map((m, i) => {
            const Icon = MODE_ICON[m.value];
            return (
              <Reveal
                key={m.value}
                variant="zoom"
                delay={i * 90}
                className={`h-full ${i % 2 ? "lg:mt-10" : ""}`}
              >
                <div className="group relative h-full overflow-hidden rounded-3xl border border-brand-100 bg-white p-6 pb-7 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:border-gold-400 hover:shadow-xl">
                  {/* Bada halka icon card ke peeche */}
                  <Icon className="absolute -bottom-5 -right-5 h-24 w-24 text-brand-50 transition duration-300 group-hover:rotate-12 group-hover:scale-110 group-hover:text-gold-400/20" />

                  <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-700 ring-4 ring-brand-50/60 transition duration-300 group-hover:bg-brand-900 group-hover:text-gold-400 group-hover:ring-gold-400/30">
                    <Icon className="h-7 w-7" />
                  </span>
                  <h3 className="relative mt-5 font-bold text-brand-900">{m.label}</h3>
                  <p className="relative mt-1 text-sm text-slate-500">{m.hint}</p>

                  {/* Hover par neeche gold line */}
                  <span className="absolute bottom-0 left-1/2 h-1 w-0 -translate-x-1/2 rounded-full bg-gold-400 transition-all duration-300 group-hover:w-2/3" />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

async function Categories() {
  const categories = await getCourseCategories();
  return <CategoryStrip categories={categories} />;
}

async function Courses() {
  const courses = await getActiveCourses(3);
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-brand-50/60 to-white py-20">
      <CoursesDecor />
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-sm font-semibold text-brand-800">
              <GraduationCap className="h-4 w-4" /> Learn online
            </span>
            <h2 className="mt-5 text-3xl font-black text-brand-900 md:text-4xl">Our courses</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">Find a course and see every mode and price.</p>
          </div>
        </Reveal>

        <div className="mt-12">
          {courses.length === 0 ? (
            <EmptyNote title="Courses are coming soon." text="Please check back shortly." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c, i) => (
                <Reveal key={c.id} delay={(i % 3) * 110} className="h-full">
                  <CourseCard course={c} />
                </Reveal>
              ))}
            </div>
          )}
        </div>

        {courses.length > 0 && (
          <Reveal className="mt-12 text-center">
            <Link
              href="/courses"
              className="transition active:scale-95 inline-flex items-center gap-2 rounded-full bg-brand-900 px-7 py-3 font-bold text-white hover:bg-brand-800"
            >
              View all courses <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: UserPlus, title: "Create your account", text: "Register with your mobile number. It takes a minute." },
    { icon: ListChecks, title: "Choose course and mode", text: "Pick a course and the mode that suits you." },
    { icon: BookOpen, title: "Start learning", text: "Books are delivered to your address for study material modes." },
  ];
  const image = SITE.howItWorks.image;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="grid items-center gap-14 md:grid-cols-2">
        {/* Left: image */}
        <Reveal variant="left">
          <div className="relative mx-auto w-full max-w-md pb-6 pl-4 pr-6">
            {/* Gold plate image ke peeche */}
            <div className="absolute bottom-0 left-0 top-8 w-[85%] rounded-3xl bg-gold-400/30" />
            <div className="absolute -right-0 top-0 h-24 w-24 rounded-full border-2 border-dashed border-brand-300" />

            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-900 shadow-xl">
              {image ? (
                <Image
                  src={image}
                  alt="Student learning online"
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

            {/* Floating chip */}
            <Float className="absolute -left-0 bottom-12 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-2xl" duration={7}>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-400 text-brand-900">
                <ListChecks className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-black leading-none text-brand-900">3 steps</p>
                <p className="mt-1 text-xs text-slate-500">and you are in</p>
              </div>
            </Float>
          </div>
        </Reveal>

        {/* Right: heading + step list */}
        <div>
          <Reveal variant="right">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-sm font-semibold text-brand-800">
              <ListChecks className="h-4 w-4" /> Simple steps
            </span>
            <h2 className="mt-5 text-3xl font-black text-brand-900 md:text-4xl">How it works</h2>
            <p className="mt-3 max-w-md text-slate-600">
              From sign up to your first class, it takes just three easy steps.
            </p>
          </Reveal>

          <div className="mt-10">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const last = i === steps.length - 1;
              return (
                <Reveal key={s.title} variant="right" delay={150 + i * 130}>
                  <div className={`group relative flex gap-6 ${last ? "" : "pb-12"}`}>
                    {/* Steps ko jodne wali dashed line */}
                    {!last && (
                      <span
                        aria-hidden
                        className="absolute bottom-2 left-8 top-[4.5rem] -ml-px border-l-2 border-dashed border-brand-300"
                      />
                    )}

                    <span className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-brand-200 bg-white text-brand-900 shadow-md transition duration-300 group-hover:-translate-y-1 group-hover:border-gold-400 group-hover:bg-brand-900 group-hover:text-gold-400 group-hover:shadow-xl">
                      <Icon className="h-7 w-7" />
                      <span className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-gold-400 text-xs font-black text-brand-900 ring-4 ring-white">
                        {i + 1}
                      </span>
                    </span>

                    <div className="pt-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-gold-600">Step {i + 1}</p>
                      <h3 className="mt-1 text-xl font-black text-brand-900">{s.title}</h3>
                      <p className="mt-1.5 max-w-sm text-base leading-relaxed text-slate-600">{s.text}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={550}>
            <Link
              href="/student/register"
              className="mt-12 inline-flex items-center gap-2 rounded-full bg-brand-900 px-7 py-3.5 font-bold text-white transition hover:bg-brand-800 active:scale-95"
            >
              Create account <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Districts() {
  // Abhi list site-config.ts se aa rahi hai. DB se laani ho to yahan fetch karke pass kar do.
  return <DistrictExplorer districts={SITE.districts} />;
}

function PartnerBand() {
  const points = [
    { icon: UserPlus, title: "Apply", text: "Send your application" },
    { icon: BadgeCheck, title: "Get approved", text: "We review and approve you" },
    { icon: Share2, title: "Share your link", text: "Earn on every enrolment" },
  ];
  const offsets = ["", "md:ml-10", "md:ml-20"];

  return (
    <section className="bg-[#EEF3FB] px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <Reveal variant="zoom">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-800 via-brand-900 to-brand-900 px-8 py-12 text-white md:px-14 md:py-16">
            {/* Background vectors */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold-400/15 blur-3xl" />
              <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" />
              <svg className="absolute inset-0 h-full w-full text-white/10" fill="currentColor">
                <defs>
                  <pattern id="partner-dots" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.3" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#partner-dots)" />
              </svg>
              <svg className="absolute -right-20 -top-16 h-[24rem] w-[24rem] text-white/15" viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="200" cy="200" r="70" />
                <circle cx="200" cy="200" r="125" />
                <circle cx="200" cy="200" r="180" strokeDasharray="4 9" />
                <circle cx="325" cy="200" r="7" fill="#fbbf24" stroke="none" />
              </svg>
              <svg className="absolute bottom-10 left-[46%] hidden h-5 w-5 text-gold-300/70 md:block" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C8 5 11 8 16 8C11 8 8 11 8 16C8 11 5 8 0 8C5 8 8 5 8 0Z" />
              </svg>
              <svg className="absolute right-[8%] top-10 hidden h-4 w-4 text-gold-300/70 md:block" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C8 5 11 8 16 8C11 8 8 11 8 16C8 11 5 8 0 8C5 8 8 5 8 0Z" />
              </svg>
            </div>

            <div className="relative grid items-center gap-12 md:grid-cols-2 md:gap-14">
              {/* Left: message + button */}
              <div>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-400 text-brand-900 shadow-lg shadow-gold-500/20">
                  <Handshake className="h-7 w-7" />
                </span>
                <h2 className="mt-6 text-3xl font-black leading-tight md:text-4xl">Become a partner</h2>
                <p className="mt-3 max-w-md text-brand-100">
                  Recommend courses to students and earn on every enrolment. Apply, get approved and start sharing your
                  own referral link.
                </p>
                <Link
                  href="/partner-apply"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-3.5 font-bold text-brand-900 shadow-lg shadow-gold-500/20 transition hover:bg-gold-300 active:scale-95"
                >
                  Apply now <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Right: 3 steps as glass chips */}
              <div className="space-y-4">
                {points.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <Float
                      key={p.title}
                      delay={i * 0.6}
                      duration={6}
                      distance={6}
                      className={`flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur ${offsets[i]}`}
                    >
                      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-400 text-brand-900">
                        <Icon className="h-6 w-6" />
                        <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-black text-brand-900">
                          {i + 1}
                        </span>
                      </span>
                      <div>
                        <p className="font-black">{p.title}</p>
                        <p className="text-sm text-brand-100">{p.text}</p>
                      </div>
                    </Float>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

async function LatestPosts() {
  const { posts } = await getPublishedPosts(3);
  if (posts.length === 0) return null; // no posts yet, so the section stays hidden

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-sm font-semibold text-brand-800">
              <Newspaper className="h-4 w-4" /> Our blog
            </span>
            <h2 className="mt-5 text-3xl font-black text-brand-900 md:text-4xl">Recent articles</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">Read our latest articles and updates.</p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 110} className="h-full">
              <BlogCard post={p} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <Link
            href="/blog"
            className="transition active:scale-95 inline-flex items-center gap-2 rounded-full bg-brand-900 px-7 py-3 font-bold text-white hover:bg-brand-800"
          >
            All articles <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Modes />
      <Suspense fallback={null}>
        <Categories />
      </Suspense>
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 py-16">
            <CardsSkeleton />
          </div>
        }
      >
        <Courses />
      </Suspense>
      <HowItWorks />
      <Districts />
      <PartnerBand />
      <Suspense fallback={null}>
        <LatestPosts />
      </Suspense>
    </>
  );
}