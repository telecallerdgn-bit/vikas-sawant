import { Suspense } from "react";
import { requireStudent } from "@/lib/student-auth";
import StudentShell from "@/components/student/StudentShell";

async function ShellWithUser({ children }: { children: React.ReactNode }) {
  const me = await requireStudent();
  return (
    <StudentShell name={me.name} mobile={me.mobile}>
      {children}
    </StudentShell>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ShellWithUser>{children}</ShellWithUser>
    </Suspense>
  );
}