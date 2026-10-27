import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BookOpen, Eye, GraduationCap, Quote, Target, Users } from "lucide-react";
import { SITE } from "@/lib/site-config";
import PageHeader from "@/components/site/PageHeader";
import Reveal from "@/components/site/Reveal";
import OfferSection from "@/components/site/OfferSection";
import StatsBand from "@/components/site/AboutStats";

export const metadata = {
  title: `About Us | ${SITE.brand}`,
  description:
    "Vikas Sawants Academy is a trusted institute for competitive exam preparation, with over 15 years of excellence.",
};

/**
 * Director ki photo. Seedha file ka naam yahan likh sakte hain, jaise "/about/vikas-sawant.webp".
 * Khali (null) chhodne par public/about folder me jo naam "vikas / sawant / director / founder" jaisa ho, wo li jati hai.
 */
const DIRECTOR_PHOTO: string | null = null;

function findDirectorPhoto(): string | null {
  if (DIRECTOR_PHOTO) return DIRECTOR_PHOTO;
  try {
    const files = fs
      .readdirSync(path.join(process.cwd(), "public", "about"))
      .filter((f) => /\.(png|jpe?g|webp|avif)$/i.test(f));
    const pick = files.find((f) => /vikas|sawant|director|founder|owner/i.test(f)) ?? files[0];
    return pick ? `/about/${encodeURI(pick)}` : null;
  } catch {
    return null;
  }
}
const photo = findDirectorPhoto();

/* ---------------- Chhote reusable hisse ---------------- */

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div>
      <h2 className="text-3xl font-black tracking-tight text-brand-900 md:text-4xl">{children}</h2>
      {/* Website ki tarah double line */}
      <span className="mt-3 block h-1.5 w-40 border-y-2 border-brand-900/70" aria-hidden="true" />
    </div>
  );
}

function DirectorCard() {
  return (
    <figure className="mx-auto w-full max-w-sm">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-brand-50">
        {photo ? (
          <Image
            src={photo}
            alt="Mr. Vikas Sawant, Founder and Director of Vikas Sawants Academy"
            fill
            sizes="(min-width: 768px) 24rem, 100vw"
            className="object-cover object-top"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-brand-300">
            <GraduationCap className="h-20 w-20" />
            <span className="text-sm font-semibold">Add photo in public/about</span>
          </div>
        )}
      </div>
      <figcaption className="relative z-10 mx-3 -mt-14 rounded-2xl bg-brand-900 px-5 py-4 text-center shadow-xl">
        <p className="text-xl font-extrabold text-white">Mr. Vikas Sawant</p>
        <p className="mt-0.5 text-sm italic text-brand-100">(Founder and Director, Vikas Sawants Academy)</p>
      </figcaption>
    </figure>
  );
}

/* ---------------- Page ---------------- */

export default function AboutPage() {
  return (
    <main className="bg-white">
      {/* Breadcrumb aur banner: baaki pages (Contact waghera) wala hi PageHeader */}
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "About Us" }]}
        badge={{ icon: Users, label: "Who we are" }}
        title="About Us"
        text="India's trusted name for competitive exam preparation, with over 15 years of excellence."
        decor={[Users, BookOpen, GraduationCap, Target]}
      />

      {/* ---------- VSA Profile ---------- */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-6 md:pb-20">
        <div className="grid items-center gap-12 md:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <SectionTitle>VSA Profile</SectionTitle>
            <div className="mt-7 space-y-4 text-lg leading-relaxed text-slate-700">
              <p>
                Vikas Sawants Academy (VSA) is India&apos;s No.1 institute for competitive exam preparation. With over 15
                years of excellence, VSA has helped thousands of students achieve success in Banking (IBPS, SBI),
                MPSC/UPSC, MBA (CAT/CMAT), SSC, and Railway exams.
              </p>
              <p>
                Our expert faculty, structured study material, and result-oriented online and offline coaching have made
                VSA a trusted name across India. During the past 15 years, we have helped over thousands of students to
                secure jobs in Banks as probationary officers and clerks. VSA&apos;s classroom Online coaching program has
                been designed to address the need of interpersonal learning.
              </p>
              <p>
                We offer weekend batches, regular tests, and free interview guidance to ensure every student is
                job-ready.
              </p>
            </div>
          </Reveal>

          <Reveal variant="right">
            <DirectorCard />
          </Reveal>
        </div>
      </section>

      {/* ---------- Stats band ---------- */}
      <StatsBand />

      {/* ---------- What we offer ---------- */}
      <OfferSection />

      {/* ---------- Mission and Vision ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <Reveal>
          <SectionTitle>Mission And Vision</SectionTitle>
        </Reveal>

        <Reveal delay={100}>
          <div className="relative mt-10 overflow-hidden rounded-3xl bg-brand-900 p-8 text-white md:p-12">
            <Quote className="absolute -left-2 -top-2 h-28 w-28 text-gold-400/20" aria-hidden="true" />
            <p className="relative max-w-3xl text-xl font-bold leading-relaxed md:text-2xl">
              We strongly believe that- &lsquo;Ambitions are achieved by Persistent hard-work and Positive temperament
              which ensures Immense success&rsquo;.
            </p>
          </div>
        </Reveal>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Reveal delay={150}>
            <div className="h-full rounded-3xl border border-brand-100 bg-white p-7 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-400 text-brand-900">
                <Eye className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-xl font-black text-brand-900">Our Vision</h3>
              <p className="mt-2 leading-relaxed text-slate-700">
                This belief comes from our vision to provide our students with the best possible knowledge and skills
                that are necessary to flourish in competitive exams.
              </p>
            </div>
          </Reveal>

          <Reveal delay={260}>
            <div className="h-full rounded-3xl border border-brand-100 bg-white p-7 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-400 text-brand-900">
                <Target className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-xl font-black text-brand-900">Our Mission</h3>
              <p className="mt-2 leading-relaxed text-slate-700">
                In today&apos;s ever-increasing competitive nature of exams, if one aspires to succeed it is imperative to
                enhance one&apos;s Aptitude and Verbal abilities. Our mission is to provide the best training and take
                our students to new heights of success.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Director's Message ---------- */}
      <section className="bg-brand-50 py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-[1fr_1.5fr]">
          <Reveal>
            <DirectorCard />
          </Reveal>

          <Reveal variant="right">
            <SectionTitle>Director&apos;s Message</SectionTitle>
            <div className="mt-7 space-y-4 text-lg leading-relaxed text-slate-700">
              <p>
                I founded this institute on the belief that every student has the ability to learn and get their dream
                banking jobs. This institute lays greater emphasis on the value of education. Our education system
                shapes the personality and character of an individual and cultivates life skills. We are fully aware of
                the responsibility and the expectations that students and parents have from us.
              </p>
              <p>
                To prove their expectations right, we offer unique and comprehensive offering to our students so that
                they stay ahead of the competition and achieve their career goals. Because of excellent results and
                selections, we have emerged as a leader in this domain and have continuously received appreciation from
                many students.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Call to action ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand-800 to-brand-900 px-8 py-12 text-white md:px-14">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gold-400/15" aria-hidden="true" />
            <div className="relative flex flex-wrap items-center justify-between gap-6">
              <div className="max-w-xl">
                <h2 className="text-3xl font-black">Ready to start your preparation?</h2>
                <p className="mt-2 text-brand-100">
                  Choose a course and the mode that suits you, or talk to our team first.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-3.5 font-bold text-brand-900 shadow-lg transition hover:bg-gold-300 active:scale-95"
                >
                  Explore courses <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="rounded-full border-2 border-white/30 px-7 py-3.5 font-bold text-white transition hover:bg-white/10"
                >
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}