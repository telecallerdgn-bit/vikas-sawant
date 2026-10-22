import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStudentAdmin } from "@/lib/sadmin-auth";
import type { TopicDTO } from "@/lib/curriculum";
import CourseTabs from "@/components/studentadmin/CourseTabs";
import CurriculumBuilder from "@/components/studentadmin/CurriculumBuilder";

type Params = Promise<{ id: string }>;

async function CurriculumView({ params }: { params: Params }) {
  await requireStudentAdmin();

  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const courseId = Number(id);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      name: true,
      topics: {
        orderBy: [{ position: "asc" }, { id: "asc" }],
        include: { lessons: { orderBy: [{ position: "asc" }, { id: "asc" }] } },
      },
    },
  });
  if (!course) notFound();

  const topics: TopicDTO[] = course.topics.map((t) => ({
    id: t.id,
    title: t.title,
    summary: t.summary ?? "",
    lessons: t.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      type: l.type,
      content: l.content ?? "",
      videoUrl: l.videoUrl ?? "",
      liveUrl: l.liveUrl ?? "",
      liveStartsAt: l.liveStartsAt ? l.liveStartsAt.toISOString() : null,
      durationMin: l.durationMin,
      isPreview: l.isPreview,
      isPublished: l.isPublished,
    })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/student-admin/courses"
          className="mb-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          All courses
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">Curriculum</h1>
        <p className="mt-1 text-sm text-slate-500">{course.name}</p>
      </div>

      <CourseTabs courseId={course.id} active="curriculum" />
      <CurriculumBuilder courseId={course.id} topics={topics} />
    </div>
  );
}

export default function CurriculumPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
      <CurriculumView params={params} />
    </Suspense>
  );
}