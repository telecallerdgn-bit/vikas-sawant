import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { requireStudent } from "@/lib/student-auth";
import { getCourseContent, getLesson } from "@/lib/student-learning";
import LessonPlayer from "@/components/student/LessonPlayer";
import Markdown from "@/components/site/Markdown";
import { PageTitle } from "@/components/student/ui";

async function View({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const me = await requireStudent();
  const p = await params;
  const courseId = Number(p.courseId);
  const lessonId = Number(p.lessonId);
  if (!Number.isInteger(courseId) || !Number.isInteger(lessonId)) notFound();

  const lesson = await getLesson(me.id, lessonId, "recorded");
  if (!lesson || lesson.courseId !== courseId || !lesson.videoUrl) notFound();

  const course = await getCourseContent(me.id, courseId, "recorded");
  const all = course ? course.topics.flatMap((t) => t.lessons) : [];
  const i = all.findIndex((l) => l.id === lessonId);
  const prev = i > 0 ? all[i - 1] : null;
  const next = i >= 0 && i < all.length - 1 ? all[i + 1] : null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/student/recorded/${courseId}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#a66e00] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> {lesson.courseName}
        </Link>
        <PageTitle title={lesson.title} subtitle={lesson.topicTitle} />
      </div>

      <LessonPlayer url={lesson.videoUrl} title={lesson.title} />

      {lesson.content?.trim() && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-[#0b2149]">Notes</h2>
          <Markdown text={lesson.content} />
        </section>
      )}

      <div className="flex items-center justify-between gap-3">
        {prev ? (
          <Link
            href={`/student/recorded/${courseId}/${prev.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#0b2149] hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/student/recorded/${courseId}/${next.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#f8b915] px-4 py-2.5 text-sm font-bold text-[#0b2149] hover:bg-[#e3a600]"
          >
            Next lesson <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

export default function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
      <View params={params} />
    </Suspense>
  );
}