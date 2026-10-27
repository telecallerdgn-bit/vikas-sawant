import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { requireStudent } from "@/lib/student-auth";
import { getCourseContent } from "@/lib/student-learning";
import { PageTitle, Panel } from "@/components/student/ui";

async function View({ params }: { params: Promise<{ courseId: string }> }) {
  const me = await requireStudent();
  const courseId = Number((await params).courseId);
  if (!Number.isInteger(courseId)) notFound();

  const course = await getCourseContent(me.id, courseId, "recorded");
  if (!course) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/student/recorded"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#a66e00] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> All recorded lessons
        </Link>
        <PageTitle title={course.name} subtitle="Pick a lesson to start watching." />
      </div>

      {course.topics.length === 0 ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
          Lessons for this course will be added soon.
        </p>
      ) : (
        course.topics.map((t) => (
          <Panel key={t.id} title={t.title}>
            <ul className="divide-y divide-slate-100 border-t border-slate-100">
              {t.lessons.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/student/recorded/${course.id}/${l.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50"
                  >
                    <PlayCircle className="h-5 w-5 shrink-0 text-[#a66e00]" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{l.title}</span>
                    {l.durationMin != null && <span className="text-xs text-slate-500">{l.durationMin} min</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        ))
      )}
    </div>
  );
}

export default function RecordedCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
      <View params={params} />
    </Suspense>
  );
}