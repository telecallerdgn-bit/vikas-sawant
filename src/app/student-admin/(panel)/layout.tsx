import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireStudentAdmin } from "@/lib/sadmin-auth";
import StudentAdminShell from "@/components/studentadmin/StudentAdminShell";

async function ShellWithUser({ children }: { children: React.ReactNode }) {
  const me = await requireStudentAdmin();
  const pending = await prisma.order.count({ where: { status: "PENDING" } });

  return (
    <StudentAdminShell name={me.name} pending={pending}>
      {children}
    </StudentAdminShell>
  );
}

export default function StudentAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ShellWithUser>{children}</ShellWithUser>
    </Suspense>
  );
}