import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, GraduationCap, ShieldCheck } from "lucide-react";
import { MODES, effectivePrices } from "@/lib/catalog";
import { getCourseBySlug } from "@/lib/site-data";
import Markdown from "@/components/site/Markdown";
import CourseDetailTabs, { type DetailTab } from "@/components/site/CourseDetailTabs";
import { Wave, rupees } from "@/components/site/ui";

const HINT = Object.fromEntries(MODES.map((m) => [m.value, m.hint]));
const LABEL = Object.fromEntries(MODES.map((m) => [m.value, m.label]));

async function View({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const prices = effectivePrices(course);

  // The offer is live only while its end date has not passed
  const offerPrice = course.offerPrice != null ? Number(course.offerPrice) : null;
  const offerEnds = course.offerEndsAt ? new Date(course.offerEndsAt) : null;
  const offerLive = offerPrice !== null && (offerEnds === null || offerEnds.getTime() > Date.now());

  // Admin saves one mode per course, so the offer belongs to the cheapest row
  const cheapestMode = [...prices].sort((a, b) => a.price - b.price)[0]?.mode;

  const tabs: DetailTab[] = [
    { key: "overview", label: "Overview", text: course.overview },
    { key: "eligibility", label: "Eligibility", text: course.eligibility },
    { key: "benefits", label: "Key Benefits", text: course.keyBenefits },
  ]
    .filter((t) => t.text && t.text.trim() !== "")
    .map((t) => ({ key: t.key, label: t.label, content: <Markdown text={t.text as string} /> }));

  return (
    <>
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold-400/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-24 pt-12 md:grid-cols-[1.2fr_1fr]">
          <div>
            <Link href="/courses" className="inline-flex items-center gap-1 text-sm font-semibold text-gold-300 hover:underline">
              <ArrowLeft className="h-4 w-4" /> All courses
            </Link>
            <h1 className="mt-4 text-3xl font-black leading-tight md:text-5xl">{course.name}</h1>
            {course.summary && <p className="mt-4 max-w-xl text-lg text-brand-100">{course.summary}</p>}
            <div className="mt-6 flex flex-wrap gap-2">
              {offerLive && (
                <span className="rounded-full bg-gold-400 px-3 py-1 text-xs font-bold text-brand-900">
                  {course.offerLabel || "Special offer"}
                </span>
              )}
              {prices.map((p) => (
                <span key={p.mode} className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  {LABEL[p.mode]}
                </span>
              ))}
            </div>
          </div>

          <div className="aspect-[16/10] overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-2xl">
            {course.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={course.coverImage}
                alt={course.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white/80">
                <GraduationCap className="h-20 w-20" />
              </div>
            )}
          </div>
        </div>
        <Wave className="absolute inset-x-0 bottom-0 text-brand-50" />
      </section>

      {/* Content ka background wave ke rang (brand-50) jaisa hai, taaki jod saaf dikhe */}
      <div className="bg-brand-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-8">
            <article className="rounded-3xl border border-brand-100 bg-white p-7 md:p-9">
              <h2 className="text-2xl font-black text-brand-900">About this course</h2>
              {course.description ? (
                <Markdown text={course.description} />
              ) : (
                <p className="mt-4 text-slate-500">The full description will be added soon.</p>
              )}
            </article>

            <CourseDetailTabs tabs={tabs} />
          </div>

          <aside className="h-fit rounded-3xl border border-brand-100 bg-white p-6 shadow-lg lg:sticky lg:top-24">
            <h2 className="text-xl font-black text-brand-900">Choose your mode</h2>

            {offerLive && (
              <p className="mt-3 rounded-xl bg-gold-100 px-3 py-2 text-sm font-semibold text-gold-800">
                {course.offerLabel || "Special offer"}
                {offerEnds &&
                  ` · ends ${offerEnds.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}`}
              </p>
            )}

            <ul className="mt-4 space-y-3">
              {prices.map((p) => {
                const discounted = offerLive && p.mode === cheapestMode && offerPrice !== null && offerPrice < p.price;
                return (
                  <li key={p.mode} className="flex items-center justify-between gap-3 rounded-2xl border border-brand-100 p-3.5">
                    <div>
                      <p className="font-bold text-brand-900">{LABEL[p.mode]}</p>
                      <p className="text-xs text-slate-500">{HINT[p.mode]}</p>
                    </div>
                    <div className="text-right">
                      {discounted ? (
                        <>
                          <p className="text-xs text-slate-400 line-through">{rupees.format(p.price)}</p>
                          <p className="text-lg font-black text-brand-700">{rupees.format(offerPrice as number)}</p>
                        </>
                      ) : (
                        <p className="text-lg font-black text-brand-700">{rupees.format(p.price)}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

                     <Link
            href={`/student/enroll/${slug}`}
            className="mt-5 block rounded-full bg-orange-500 py-3.5 text-center font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600"
          >
            Enroll now
          </Link>
          <p className="mt-3 text-center text-xs text-slate-500">
            New student?{" "}
            <Link href="/student/register" className="font-semibold text-orange-600 hover:underline">
              Create your account
            </Link>{" "}
            first, then enroll.
          </p>
          <p className="mt-3 flex items-start gap-2 text-xs text-slate-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            After you enroll, our team confirms your payment and opens the course in your account.
          </p>
          </aside>
        </div>
      </div>
    </>
  );
}

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="h-72 animate-pulse rounded-3xl bg-brand-100/60" />
        </div>
      }
    >
      <View params={params} />
    </Suspense>
  );
}