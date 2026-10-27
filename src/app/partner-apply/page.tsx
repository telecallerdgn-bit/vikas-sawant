import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, CreditCard, FileText, Handshake, Rocket } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/site-config";
import PartnerApplyForm from "@/components/PartnerApplyForm";
import ApplicationStatusCheck from "@/components/ApplicationStatusCheck";
import Reveal from "@/components/site/Reveal";
import Float from "@/components/site/Float";

async function Form() {
  const districts = await prisma.district.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return <PartnerApplyForm districts={districts} />;
}

const STEPS = [
  { icon: FileText, title: "Apply", text: "Fill in the short form" },
  { icon: BadgeCheck, title: "Get approved", text: "We review your application" },
  { icon: CreditCard, title: "Pay one-time fee", text: "Registration and training" },
  { icon: Rocket, title: "Go live", text: "Start with your own referral code" },
];

function Sparkle({ className }: { className: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={className} fill="currentColor">
      <path d="M8 0C8 5 11 8 16 8C11 8 8 11 8 16C8 11 5 8 0 8C5 8 8 5 8 0Z" />
    </svg>
  );
}

export default function PartnerApplyPage() {
  return (
    <main className="min-h-screen bg-[#EEF3FB] font-[family-name:var(--font-lato)]">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-b-[2.5rem] bg-gradient-to-br from-brand-800 via-brand-900 to-brand-900 px-4 pb-32 pt-12 text-white md:pt-16">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-gold-400/15 blur-3xl" />
          <svg className="absolute inset-0 h-full w-full text-white/10" fill="currentColor">
            <defs>
              <pattern id="partner-page-dots" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#partner-page-dots)" />
          </svg>
          <svg className="absolute -right-24 -top-20 h-[26rem] w-[26rem] text-white/15" viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="200" cy="200" r="70" />
            <circle cx="200" cy="200" r="125" />
            <circle cx="200" cy="200" r="180" strokeDasharray="4 9" />
            <circle cx="325" cy="200" r="7" fill="#fbbf24" stroke="none" />
          </svg>
          <Handshake className="absolute -bottom-12 right-[6%] hidden h-56 w-56 -rotate-12 text-white/5 md:block" strokeWidth={1} />
          <div className="absolute left-[46%] top-12 hidden h-5 w-5 md:block">
            <Float className="h-full w-full" distance={8} duration={5}>
              <Sparkle className="h-full w-full text-gold-300/70" />
            </Float>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-100 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          <Reveal>
            <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-gold-300 backdrop-blur">
              <Handshake className="h-4 w-4" /> {SITE.brand} Partners
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight md:text-5xl">
              Become a <span className="italic text-gold-400">partner</span>
            </h1>
            <p className="mt-4 max-w-xl text-brand-100">
              Recommend courses and earn on every enrolment. Apply, get approved, pay the one-time fee and your
              account goes live with your own referral code.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.title} delay={150 + i * 110}>
                  <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-400 text-brand-900">
                      <Icon className="h-6 w-6" />
                      <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-black text-brand-900">
                        {i + 1}
                      </span>
                    </span>
                    <div>
                      <p className="font-black">{s.title}</p>
                      <p className="text-sm text-brand-100">{s.text}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form + status: hero ke upar thoda chadha hua */}
      <div className="relative z-10 mx-auto -mt-16 max-w-6xl px-4 pb-16">
        <div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
          <Reveal variant="up">
            <Suspense fallback={<p className="rounded-3xl bg-white p-8 text-sm text-slate-400 shadow-xl">Loading...</p>}>
              <Form />
            </Suspense>
          </Reveal>
          <Reveal variant="up" delay={150} className="lg:sticky lg:top-6">
            <ApplicationStatusCheck />
          </Reveal>
        </div>
      </div>
    </main>
  );
}