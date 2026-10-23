import Link from "next/link";
import { Suspense } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  Handshake,
  Layers,
  PlayCircle,
  Radio,
  UserPlus,
  Video,
  GraduationCap,
  ListChecks,
} from "lucide-react";
import type { CourseMode } from "@prisma/client";
import { MODES } from "@/lib/catalog";
import { SITE } from "@/lib/site-config";
import { getActiveCourses, getCourseCategories, getPublishedPosts } from "@/lib/site-data";
import CourseCard from "@/components/site/CourseCard";
import BlogCard from "@/components/site/BlogCard";
import CategoryStrip from "@/components/site/CategoryStrip";
import { CardsSkeleton, EmptyNote, SectionHead, Wave } from "@/components/site/ui";

export const metadata = { title: `${SITE.brand} | ${SITE.tagline}` };

const MODE_ICON: Record<CourseMode, LucideIcon> = {
  ONLINE_PRERECORDED: PlayCircle,
  LIVE_STUDY: Video,
  STUDY_ONLY: BookOpen,
  HYBRID: Layers,
  LIVE_ONLY: Radio,
};

function HeroArt() {
  const tiles = [
    { icon: Video, title: "Live classes", text: "Learn with a teacher, live", cls: "left-0 top-6 -rotate-3" },
    { icon: BookOpen, title: "Study material", text: "Books sent to your home", cls: "right-0 top-28 rotate-2" },
    { icon: PlayCircle, title: "Recorded lessons", text: "Watch any time", cls: "bottom-4 left-8 rotate-1" },
  ];

  return (
    <div className="relative mx-auto hidden h-[26rem] w-full max-w-md md:block">
      {/* Gold plate: dark navy background par saaf dikhta hai */}
      <div className="absolute inset-8 rounded-[3rem] bg-gradient-to-br from-gold-300 to-gold-500" />
      <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brand-900 shadow-2xl">
        <GraduationCap className="h-14 w-14" />
      </div>
      {tiles.map((t) => {
        const Icon = t.icon;
        return (
          <div
            key={t.title}
            className={`absolute flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 text-slate-800 shadow-xl ${t.cls}`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold text-brand-900">{t.title}</span>
              <span className="block text-xs text-slate-500">{t.text}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-900 text-white">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold-400/15 blur-3xl" />
      <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-28 pt-16 md:grid-cols-2 md:pt-24">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-gold-300">{SITE.hero.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
            {SITE.hero.title} <span className="italic text-gold-400">{SITE.hero.accent}</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-brand-100">{SITE.hero.text}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-3.5 font-bold text-brand-900 shadow-lg shadow-gold-500/30 hover:bg-gold-300"
            >
              Explore courses <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/student/register"
              className="rounded-full border-2 border-white/30 px-7 py-3.5 font-bold text-white hover:bg-white/10"
            >
              Create account
            </Link>
          </div>
        </div>

        <HeroArt />
      </div>

      <Wave className="absolute inset-x-0 bottom-0 text-brand-50" />
    </section>
  );
}

function Modes() {
  return (
    // Section ka background wave ke rang (brand-50) jaisa hi hai, taaki jod saaf dikhe
    <section className="bg-brand-50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <SectionHead
          eyebrow="Learn your way"
          title="Pick the mode that fits you"
          text="The same course, offered in different ways. Choose what matches your time and budget."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {MODES.map((m) => {
            const Icon = MODE_ICON[m.value];
            return (
              <div
                key={m.value}
                className="rounded-3xl border border-brand-100 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="mt-4 font-bold text-brand-900">{m.label}</h3>
                <p className="mt-1 text-sm text-slate-500">{m.hint}</p>
              </div>
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
  const courses = await getActiveCourses(6);
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHead eyebrow="Learn online" title="Our courses" text="Find a course and see every mode and price." />

        <div className="mt-10">
          {courses.length === 0 ? (
            <EmptyNote title="Courses are coming soon." text="Please check back shortly." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </div>

        {courses.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-full bg-brand-900 px-7 py-3 font-bold text-white hover:bg-brand-800"
            >
              View all courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
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

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <SectionHead eyebrow="Simple steps" title="How it works" />
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="relative rounded-3xl border border-brand-100 bg-white p-7 shadow-sm">
              <span className="absolute -top-4 left-7 flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 text-sm font-black text-brand-900">
                {i + 1}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-900 text-white">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-brand-900">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PartnerBand() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand-800 to-brand-900 px-8 py-12 text-white md:px-14">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gold-400/15" />
        <div className="absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/5" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Handshake className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-3xl font-black">Become a partner</h2>
            <p className="mt-2 text-brand-100">
              Recommend courses to students and earn on every enrolment. Apply, get approved and start sharing your
              own referral link.
            </p>
          </div>
          <Link
            href="/partner-apply"
            className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-3.5 font-bold text-brand-900 shadow-lg hover:bg-gold-300"
          >
            Apply now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

async function LatestPosts() {
  const { posts } = await getPublishedPosts(3);
  if (posts.length === 0) return null; // no posts yet, so the section stays hidden

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHead eyebrow="Our blog" title="Recent articles" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <BlogCard key={p.id} post={p} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/blog" className="inline-flex items-center gap-2 font-bold text-brand-900 hover:text-brand-600">
            All articles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
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
      <PartnerBand />
      <Suspense fallback={null}>
        <LatestPosts />
      </Suspense>
    </>
  );
}