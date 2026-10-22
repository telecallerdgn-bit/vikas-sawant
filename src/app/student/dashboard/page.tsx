import { Suspense } from "react";
import Link from "next/link";
import { requireStudent } from "@/lib/student-auth";
import KindLogoutButton from "@/components/KindLogoutButton";

async function View() {
  const me = await requireStudent();

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6 font-[family-name:var(--font-lato)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Student</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Hello, {me.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {me.mobile}
            {me.partner ? ` · Referred by ${me.partner.name}` : ""}
          </p>
        </div>
        <KindLogoutButton endpoint="/api/student/logout" redirectTo="/student/login" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="font-medium text-slate-800">Your courses will appear here.</p>
        <p className="mt-1 text-sm text-slate-500">Course purchase and lessons are coming in the next steps.</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
          Back to website
        </Link>
      </div>
    </main>
  );
}

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-400">Loading...</p>}>
      <View />
    </Suspense>
  );
}