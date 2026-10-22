import { Suspense } from "react";
import { Clock, Coins, GraduationCap, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStudentAdmin } from "@/lib/sadmin-auth";
import { StatCard, inr } from "@/components/subsuper/ui";

async function Overview() {
  await requireStudentAdmin();

  const [students, paid, pending] = await Promise.all([
    prisma.student.count(),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: { _all: true } }),
    prisma.order.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={String(students)} sub="Registered students" icon={GraduationCap} tone="purple" />
        <StatCard
          label="Paid sales"
          value={inr.format(Number(paid._sum.amount ?? 0))}
          sub={`${paid._count._all} paid orders`}
          icon={Coins}
          tone="blue"
        />
        <StatCard label="Paid orders" value={String(paid._count._all)} sub="Completed purchases" icon={ShoppingBag} tone="green" />
        <StatCard label="Pending orders" value={String(pending)} sub="Waiting for payment" icon={Clock} tone="orange" />
      </div>

      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
        Courses, Blog, Students and Orders are built in the next steps. For now this panel shows live numbers only.
      </p>
    </div>
  );
}

export default function StudentAdminOverviewPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Student Admin</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">Students, orders and sales at a glance.</p>
      </header>
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <Overview />
      </Suspense>
    </div>
  );
}