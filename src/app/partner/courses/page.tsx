import Link from "next/link";
import { Suspense } from "react";
import { getCoursesWithEarning, requirePartner } from "@/lib/partner";
import { formatInr } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Note from "@/components/ui/Note";
import Icon from "@/components/icons";
import { PageSkeleton } from "@/components/ui/Skeletons";

const MODE_LABEL: Record<string, string> = {
  LIVE_STUDY: "Live + Study Material",
  HYBRID: "Hybrid",
  STUDY_ONLY: "Study Material Only",
  ONLINE_PRERECORDED: "Online Prerecorded",
};

async function CoursesView() {
  await requirePartner();
  const courses = await getCoursesWithEarning();

  return (
    <div className="space-y-6">
      {courses.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No courses are available right now.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((c) => (
            <article key={c.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Icon name="book" className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-slate-900">{c.name}</h2>
              <p className="mt-1 text-xs font-medium text-slate-500">{MODE_LABEL[c.mode] ?? c.mode}</p>
              <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs text-slate-500">Course price</p>
                  <p className="text-lg font-bold tabular-nums text-slate-900">{formatInr(c.price)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">You earn about</p>
                  <p className="text-lg font-bold tabular-nums text-emerald-700">{formatInr(c.earning)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Link
        href="/partner/link"
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        <Icon name="link" className="h-4 w-4" />
        Get my referral link
      </Link>

      <Note>
        Commission shown is an estimate based on the current commission rule, after GST and payment fees. The exact
        amount is calculated when the order is paid.
      </Note>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Promote Courses" description="Courses you can promote and the commission you can earn." />
      <Suspense fallback={<PageSkeleton cards={3} />}>
        <CoursesView />
      </Suspense>
    </div>
  );
}