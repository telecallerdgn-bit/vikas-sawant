import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, parsePage, requirePartner } from "@/lib/partner";
import { formatDate, formatInr, formatInrShort, formatTime, toRupees } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import StatCards, { type Stat } from "@/components/ui/StatCards";
import TableCard, { EmptyRow, TH, THEAD } from "@/components/ui/TableCard";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import Note from "@/components/ui/Note";
import { PageSkeleton } from "@/components/ui/Skeletons";

type SearchParams = Promise<{ page?: string }>;

async function CommissionsView({ searchParams }: { searchParams: SearchParams }) {
  const me = await requirePartner();
  const page = parsePage((await searchParams).page);
  const where = { userId: me.id, orderId: { not: null } };

  const [entries, total, credits, debits] = await Promise.all([
    prisma.ledgerEntry.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        order: { select: { student: { select: { name: true } }, course: { select: { name: true } } } },
      },
    }),
    prisma.ledgerEntry.count({ where }),
    prisma.ledgerEntry.aggregate({ where: { ...where, amount: { gt: 0 } }, _sum: { amount: true } }),
    prisma.ledgerEntry.aggregate({ where: { ...where, amount: { lt: 0 } }, _sum: { amount: true } }),
  ]);

  const earned = toRupees(credits._sum.amount);
  const reversed = toRupees(debits._sum.amount);

  const stats: Stat[] = [
    { label: "Commission earned", value: formatInrShort(earned), hint: "Credited from orders", icon: "trending", tone: "emerald" },
    { label: "Reversed", value: formatInrShort(Math.abs(reversed)), hint: "Refunded orders", icon: "userX", tone: "rose" },
    { label: "Net commission", value: formatInrShort(earned + reversed), hint: "Earned minus reversed", icon: "rupee", tone: "blue" },
  ];

  return (
    <div className="space-y-6">
      <StatCards items={stats} cols={3} />

      <TableCard
        title="All commission"
        count={total}
        footer={<Pagination basePath="/partner/commissions" page={page} total={total} pageSize={PAGE_SIZE} noun="entries" />}
      >
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className={THEAD}>
            <tr>
              <th className={TH}>Date</th>
              <th className={TH}>Order</th>
              <th className={TH}>Student</th>
              <th className={TH}>Course</th>
              <th className={TH}>Type</th>
              <th className={`${TH} text-right`}>Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.length === 0 && (
              <EmptyRow colSpan={6} title="No commission yet" hint="Share your referral link to start earning." />
            )}
            {entries.map((e) => {
              const amount = toRupees(e.amount);
              return (
                <tr key={e.id} className="transition-colors hover:bg-blue-50/40">
                  <td className="px-6 py-4">
                    <p className="text-slate-800">{formatDate(e.createdAt)}</p>
                    <p className="text-xs text-slate-400">{formatTime(e.createdAt)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">#{e.orderId}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{e.order?.student.name ?? "—"}</td>
                  <td className="px-6 py-4 text-slate-800">{e.order?.course.name ?? "—"}</td>
                  <td className="px-6 py-4">
                    <StatusBadge value={e.type} />
                  </td>
                  <td className={`px-6 py-4 text-right font-semibold tabular-nums ${amount < 0 ? "text-red-600" : "text-emerald-700"}`}>
                    {amount > 0 ? "+" : ""}
                    {formatInr(amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableCard>

      <Note>Commission earned in the last 15 days is on hold and becomes available for withdrawal after that.</Note>
    </div>
  );
}

export default function CommissionsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Commissions" description="Commission credited for every order placed through your link." />
      <Suspense fallback={<PageSkeleton cards={3} />}>
        <CommissionsView searchParams={searchParams} />
      </Suspense>
    </div>
  );
}