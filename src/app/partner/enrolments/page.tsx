import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, getStudentCount, parsePage, requirePartner } from "@/lib/partner";
import { formatDate, formatInr, formatInrShort, toRupees } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import StatCards, { type Stat } from "@/components/ui/StatCards";
import TableCard, { EmptyRow, TH, THEAD } from "@/components/ui/TableCard";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import { PageSkeleton } from "@/components/ui/Skeletons";

type SearchParams = Promise<{ page?: string }>;

async function EnrolmentsView({ searchParams }: { searchParams: SearchParams }) {
  const me = await requirePartner();
  const page = parsePage((await searchParams).page);
  const where = { partnerId: me.id };

  const [orders, total, students, paid] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { student: { select: { name: true } }, course: { select: { name: true } } },
    }),
    prisma.order.count({ where }),
    getStudentCount(me.id),
    prisma.order.aggregate({ where: { ...where, status: "PAID" }, _count: { _all: true }, _sum: { amount: true } }),
  ]);

  const stats: Stat[] = [
    { label: "Students referred", value: String(students), hint: "Through your link", icon: "userCheck", tone: "blue" },
    { label: "Paid enrolments", value: String(paid._count._all), hint: "Payment received", icon: "check", tone: "emerald" },
    { label: "Sales value", value: formatInrShort(toRupees(paid._sum.amount)), hint: "Paid orders only", icon: "rupee", tone: "violet" },
  ];

  return (
    <div className="space-y-6">
      <StatCards items={stats} cols={3} />

      <TableCard
        title="Enrolments"
        count={total}
        footer={<Pagination basePath="/partner/enrolments" page={page} total={total} pageSize={PAGE_SIZE} noun="enrolments" />}
      >
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className={THEAD}>
            <tr>
              <th className={TH}>Order</th>
              <th className={TH}>Student</th>
              <th className={TH}>Course</th>
              <th className={`${TH} text-right`}>Amount</th>
              <th className={TH}>Status</th>
              <th className={TH}>Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length === 0 && (
              <EmptyRow colSpan={6} title="No enrolments yet" hint="Students who buy through your link appear here." />
            )}
            {orders.map((o) => (
              <tr key={o.id} className="transition-colors hover:bg-blue-50/40">
                <td className="px-6 py-4">
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">#{o.id}</span>
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">{o.student.name}</td>
                <td className="px-6 py-4 text-slate-800">{o.course.name}</td>
                <td className="px-6 py-4 text-right font-semibold tabular-nums text-slate-900">{formatInr(toRupees(o.amount))}</td>
                <td className="px-6 py-4">
                  <StatusBadge value={o.status} />
                </td>
                <td className="px-6 py-4 text-slate-700">{formatDate(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}

export default function EnrolmentsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Enrolments" description="Students who enrolled through your referral link." />
      <Suspense fallback={<PageSkeleton cards={3} />}>
        <EnrolmentsView searchParams={searchParams} />
      </Suspense>
    </div>
  );
}