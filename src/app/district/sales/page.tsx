import { Suspense } from "react";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getDistrictContext } from "@/lib/district";
import {
  Avatar,
  Card,
  Cards,
  EmptyRow,
  NoDistrict,
  PageHeader,
  PageSkeleton,
  StatCard,
  THEAD,
  dateFmt,
  inr,
  timeFmt,
} from "@/components/district/ui";

const LIMIT = 100;

async function Sales() {
  const { district } = await getDistrictContext();
  if (!district) return <NoDistrict />;

  const where = { status: OrderStatus.PAID, partner: { districtId: district.id } };

  const [orders, agg] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: LIMIT,
      select: {
        id: true,
        amount: true,
        createdAt: true,
        course: { select: { name: true } },
        student: { select: { name: true } },
        partner: { select: { name: true } },
      },
    }),
    prisma.order.aggregate({ where, _sum: { amount: true }, _count: { _all: true } }),
  ]);

  const count = agg._count._all;
  const revenue = Number(agg._sum.amount ?? 0);
  const average = count ? revenue / count : 0;

  return (
    <>
      <Cards>
        <StatCard label="Revenue" value={inr.format(revenue)} note="Paid orders" tone="blue" icon="rupee" />
        <StatCard label="Orders" value={String(count)} note="Enrolments in your district" tone="green" icon="check" />
        <StatCard label="Average order" value={inr.format(average)} note="Revenue per order" tone="violet" icon="trending" />
        <StatCard
          label="Latest order"
          value={orders[0] ? dateFmt.format(orders[0].createdAt) : "—"}
          note={orders[0] ? timeFmt.format(orders[0].createdAt) : "No orders yet"}
          tone="amber"
          icon="clock"
        />
      </Cards>

      <Card title="Course sales & enrolments" total={count}>
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className={THEAD}>
            <tr>
              <th className="px-6 py-3.5">Order</th>
              <th className="px-6 py-3.5">Student</th>
              <th className="px-6 py-3.5">Course</th>
              <th className="px-6 py-3.5">Partner</th>
              <th className="px-6 py-3.5">Date</th>
              <th className="px-6 py-3.5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o) => (
              <tr key={o.id} className="transition-colors hover:bg-slate-50/70">
                <td className="px-6 py-4">
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">#{o.id}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={o.student.name} />
                    <span className="font-medium text-slate-900">{o.student.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-800">{o.course.name}</td>
                <td className="px-6 py-4 text-slate-700">{o.partner?.name ?? "—"}</td>
                <td className="px-6 py-4">
                  <p className="text-slate-800">{dateFmt.format(o.createdAt)}</p>
                  <p className="text-xs text-slate-400">{timeFmt.format(o.createdAt)}</p>
                </td>
                <td className="px-6 py-4 text-right font-medium tabular-nums text-slate-900">
                  {inr.format(Number(o.amount))}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <EmptyRow cols={6} title="No sales yet" text="Paid orders from your district appear here." />
            )}
          </tbody>
        </table>
        {count > LIMIT && (
          <p className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
            Showing the latest {LIMIT} of {count} orders.
          </p>
        )}
      </Card>
    </>
  );
}

export default function DistrictSalesPage() {
  return (
    <>
      <PageHeader title="Course Sales & Enrolments" subtitle="Every paid order from partners in your district." />
      <Suspense fallback={<PageSkeleton />}>
        <Sales />
      </Suspense>
    </>
  );
}