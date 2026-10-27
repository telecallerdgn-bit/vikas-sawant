import { Suspense } from "react";
import { requireStudent } from "@/lib/student-auth";
import { getOwnedCourses } from "@/lib/student-learning";
import LearningCourseList from "@/components/student/LearningCourseList";
import { PageTitle } from "@/components/student/ui";

async function View() {
  const me = await requireStudent();
  const courses = await getOwnedCourses(me.id, "materials");
  return (
    <LearningCourseList
      courses={courses}
      hrefBase="/student/materials"
      noun="notes"
      title="Study Materials"
      emptyTitle="No study materials yet."
      emptyText="Study materials open for your paid courses once they are added."
    />
  );
}

export default function MaterialsPage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Study Materials" subtitle="Notes and reading material for your courses." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View />
      </Suspense>
    </div>
  );
}