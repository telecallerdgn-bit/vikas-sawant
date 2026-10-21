import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireSubSuper } from "@/lib/subsuper";
import SubSuperShell from "@/components/subsuper/SubSuperShell";

async function ShellWithUser({ children }: { children: React.ReactNode }) {
  const me = await requireSubSuper();
  const pending = await prisma.partnerApplication.count({
    where: { status: { in: ["SUBMITTED", "UNDER_REVIEW", "MORE_INFO"] } },
  });

  return (
    <SubSuperShell name={me.name} pending={pending}>
      {children}
    </SubSuperShell>
  );
}

export default function SubSuperLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ShellWithUser>{children}</ShellWithUser>
    </Suspense>
  );
}