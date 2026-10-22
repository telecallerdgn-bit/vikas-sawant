import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStudentAdmin } from "@/lib/sadmin-auth";
import { effectivePrices } from "@/lib/catalog";
import CourseTabs from "@/components/studentadmin/CourseTabs";
import CourseForm from "@/components/studentadmin/CourseForm";
import { SAHeader } from "@/components/studentadmin/ui";

async function View({ params }: { params: Promise<{ id: string }> }) {
  await requireStudentAdmin();

  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [course, categories] = await Promise.all([
    prisma.course.findUnique({ where: { id }, include: { prices: true } }),
    prisma.courseCategory.findMany({
      orderBy: [{ position: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);
  if (!course) notFound();

  // Older courses had one mode and price, so the form starts with those
  const prices: Record<string, string> = {};
  for (const p of effectivePrices(course)) prices[p.mode] = String(p.price);

  return (
    <div className="space-y-6">
      <CourseTabs courseId={id} active="details" />
      <CourseForm
        categories={categories}
        initial={{
          id: course.id,
          name: course.name,
          slug: course.slug ?? "",
          summary: course.summary ?? "",
          description: course.description ?? "",
          coverImage: course.coverImage ?? "",
          isActive: course.isActive,
          prices,
          categoryId: course.categoryId,
          overview: course.overview ?? "",
          eligibility: course.eligibility ?? "",
          keyBenefits: course.keyBenefits ?? "",
          offerPrice: course.offerPrice ? String(course.offerPrice) : "",
          offerLabel: course.offerLabel ?? "",
          offerEndsAt: course.offerEndsAt ? course.offerEndsAt.toISOString().slice(0, 10) : "",
        }}
      />
    </div>
  );
}

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="space-y-6">
      <SAHeader title="Edit course" subtitle="Changes appear on the website as soon as you save." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View params={params} />
      </Suspense>
    </div>
  );
}