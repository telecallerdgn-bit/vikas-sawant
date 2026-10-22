import { Suspense } from "react";
import { requireStudentAdmin } from "@/lib/sadmin-auth";
import BlogForm from "@/components/studentadmin/BlogForm";
import { SAHeader } from "@/components/studentadmin/ui";

async function View() {
  await requireStudentAdmin();
  return <BlogForm initial={{ title: "", slug: "", excerpt: "", content: "", coverImage: "", status: "DRAFT" }} />;
}

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <SAHeader title="New post" subtitle="Save it as a draft first, publish when it is ready." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View />
      </Suspense>
    </div>
  );
}