import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { requireStudent } from "@/lib/student-auth";
import { getCourseContent } from "@/lib/student-learning";
import Markdown from "@/components/site/Markdown";
import { PageTitle, Panel } from "@/components/student/ui";

function size(n: number) {
  return n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
}

async function View({ params }: { params: Promise<{ courseId: string }> }) {
  const me = await requireStudent();
  const courseId = Number((await params).courseId);
  if (!Number.isInteger(courseId)) notFound();

  const course = await getCourseContent(me.id, courseId, "materials");
  if (!course) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/student/materials"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#a66e00] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> All study materials
        </Link>
        <PageTitle title={course.name} subtitle="Tap a title to read it or download the files." />
      </div>

      {course.topics.length === 0 ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
          Study material for this course will be added soon.
        </p>
      ) : (
        course.topics.map((t) => (
          <Panel key={t.id} title={t.title}>
            <div className="divide-y divide-slate-100 border-t border-slate-100">
              {t.lessons.map((l) => (
                <details key={l.id} className="group px-5 py-3.5">
                  <summary className="flex cursor-pointer list-none items-center gap-3 text-sm font-medium text-slate-800">
                    <FileText className="h-5 w-5 shrink-0 text-[#a66e00]" />
                    <span className="min-w-0 flex-1">{l.title}</span>
                    {l.files.length > 0 && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {l.files.length} {l.files.length === 1 ? "file" : "files"}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 group-open:hidden">Open</span>
                    <span className="hidden text-xs text-slate-400 group-open:inline">Close</span>
                  </summary>

                  <div className="mt-3 space-y-4">
                    {l.content?.trim() && <Markdown text={l.content} />}

                    {l.files.length > 0 && (
                      <ul className="space-y-2">
                        {l.files.map((f) => (
                          <li key={f.id}>
                            <a
                              href={`/api/student/materials/${f.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm hover:bg-amber-50"
                            >
                              <Download className="h-4 w-4 shrink-0 text-[#a66e00]" />
                              <span className="min-w-0 flex-1 truncate font-medium text-[#0b2149]">{f.name}</span>
                              <span className="text-xs text-slate-500">{size(f.sizeBytes)}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}

                    {!l.content?.trim() && l.files.length === 0 && (
                      <p className="text-sm text-slate-500">Nothing added to this lesson yet.</p>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </Panel>
        ))
      )}
    </div>
  );
}

export default function MaterialsCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
      <View params={params} />
    </Suspense>
  );
}