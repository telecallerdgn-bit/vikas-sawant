import { Suspense } from "react";
import { requireStudent } from "@/lib/student-auth";
import { getOwnedCourses } from "@/lib/student-learning";
import LearningCourseList from "@/components/student/LearningCourseList";
import { PageTitle } from "@/components/student/ui";

async function View() {
  const me = await requireStudent();
  const courses = await getOwnedCourses(me.id, "recorded");
  return (
    <LearningCourseList
      courses={courses}
      hrefBase="/student/recorded"
      noun="videos"
      title="Recorded Lessons"
      emptyTitle="No recorded lessons yet."
      emptyText="Recorded lessons open for courses bought in the Online Prerecorded or Hybrid mode, once your order is paid."
    />
  );
}

export default function RecordedPage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Recorded Lessons" subtitle="Watch your lessons any time." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View />
      </Suspense>
    </div>
  );
}