import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireStudentAdmin } from "@/lib/sadmin-auth";
import CourseForm from "@/components/studentadmin/CourseForm";
import { SAHeader } from "@/components/studentadmin/ui";

async function View() {
  await requireStudentAdmin();
  const categories = await prisma.courseCategory.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });
  return (
    <CourseForm
      categories={categories}
      initial={{
        name: "",
        slug: "",
        summary: "",
        description: "",
        coverImage: "",
        isActive: true,
        prices: {},
        categoryId: null,
        overview: "",
        eligibility: "",
        keyBenefits: "",
        offerPrice: "",
        offerLabel: "",
        offerEndsAt: "",
      }}
    />
  );
}

export default function NewCoursePage() {
  return (
    <div className="space-y-6">
      <SAHeader title="Add course" subtitle="Fill in the details, pick the modes you sell and set their prices." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View />
      </Suspense>
    </div>
  );
}