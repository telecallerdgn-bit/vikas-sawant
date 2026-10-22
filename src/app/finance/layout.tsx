import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireFinance } from "@/lib/finance";
import FinanceShell from "@/components/finance/FinanceShell";

async function ShellWithUser({ children }: { children: React.ReactNode }) {
  const me = await requireFinance();
  const pending = await prisma.payout.count({ where: { status: "REQUESTED" } });

  return (
    <FinanceShell name={me.name} pending={pending}>
      {children}
    </FinanceShell>
  );
}

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ShellWithUser>{children}</ShellWithUser>
    </Suspense>
  );
}