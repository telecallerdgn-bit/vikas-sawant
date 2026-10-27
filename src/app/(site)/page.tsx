import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Layers,
  Newspaper,
  PlayCircle,
  Radio,
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
import Testimonials from "@/components/site/Testimonials";
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
      <Testimonials items={SITE.testimonials} />
      <Suspense fallback={null}>
        <LatestPosts />
      </Suspense>
    </>
  );
}