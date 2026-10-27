import Link from "next/link";
import { ChevronRight, ImageOff } from "lucide-react";
import type { OwnedCourse } from "@/lib/student-learning";
import { Empty, Panel } from "@/components/student/ui";

export default function LearningCourseList({
  courses,
  hrefBase,
  noun,
  title,
  emptyTitle,
  emptyText,
}: {
  courses: OwnedCourse[];
  hrefBase: string;
  noun: string;
  title: string;
  emptyTitle: string;
  emptyText: string;
}) {
  if (courses.length === 0) {
    return (
      <Panel title={title}>
        <Empty title={emptyTitle} text={emptyText} cta={{ href: "/student/courses", label: "My courses" }} />
      </Panel>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((c) => {
        const body = (
          <>
            <div className="aspect-[16/9] bg-gradient-to-br from-[#0b2149] to-[#16346b]">
              {c.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.coverImage} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-white/60">
                  <ImageOff className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-bold leading-snug text-[#0b2149]">{c.name}</h3>
              <p className="mt-2 flex items-center justify-between text-sm text-slate-600">
                {c.count > 0 ? (
                  <>
                    <span>
                      {c.count} {noun}
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#a66e00]" />
                  </>
                ) : (
                  <span className="text-slate-400">Will be added soon</span>
                )}
              </p>
            </div>
          </>
        );

        return c.count > 0 ? (
          <Link
            key={c.id}
            href={`${hrefBase}/${c.id}`}
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {body}
          </Link>
        ) : (
          <div key={c.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {body}
          </div>
        );
      })}
    </div>
  );
}