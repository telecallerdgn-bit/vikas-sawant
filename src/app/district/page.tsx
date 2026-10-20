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
} from "@/components/district/ui";

async function Overview() {
  const { session, district } = await getDistrictContext();
  if (!district) return <NoDistrict />;

  const [orders, partnerTotal, partnerActive, wallet, earned] = await Promise.all([
    prisma.order.findMany({
      where: { status: OrderStatus.PAID, partner: { districtId: district.id } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        course: { select: { name: true } },
        student: { select: { name: true } },
        partner: { select: { name: true } },
      },
    }),
    prisma.user.count({ where: { role: "PARTNER", districtId: district.id } }),
    prisma.user.count({ where: { role: "PARTNER", districtId: district.id, isActive: true } }),
    prisma.ledgerEntry.aggregate({ where: { userId: session.userId }, _sum: { amount: true } }),
    prisma.ledgerEntry.aggregate({ where: { userId: session.userId, amount: { gt: 0 } }, _sum: { amount: true } }),
  ]);

  // Paise me jodte hain, taaki floating point error na aaye
  const toPaise = (n: unknown) => Math.round(Number(n) * 100);
  const totalPaise = orders.reduce((a, o) => a + toPaise(o.amount), 0);

  const byCourse = new Map<string, { orders: number; paise: number }>();
  for (const o of orders) {
    const row = byCourse.get(o.course.name) ?? { orders: 0, paise: 0 };
    row.orders += 1;
    row.paise += toPaise(o.amount);
    byCourse.set(o.course.name, row);
  }
  const courses = [...byCourse.entries()].sort((a, b) => b[1].paise - a[1].paise);
  const maxPaise = courses[0]?.[1].paise ?? 1;

  return (
    <>
      <Cards>
        <StatCard
          label="Course sales"
          value={inr.format(totalPaise / 100)}
          note={`${orders.length} ${orders.length === 1 ? "order" : "orders"}`}
          tone="blue"
          icon="rupee"
        />
        <StatCard
          label="Active partners"
          value={String(partnerActive)}
          note={`${partnerTotal} total`}
          tone="green"
          icon="check"
        />
        <StatCard
          label="Your earnings"
          value={inr.format(Number(earned._sum.amount ?? 0))}
          note="Commission credited to you"
          tone="violet"
          icon="trending"
        />
        <StatCard
          label="Your wallet"
          value={inr.format(Number(wallet._sum.amount ?? 0))}
          note="Available balance"
          tone="amber"
          icon="rupee"
        />
      </Cards>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card title="Sales by course" total={courses.length}>
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className={THEAD}>
                <tr>
                  <th className="px-6 py-3.5">Course</th>
                  <th className="px-6 py-3.5 text-right">Orders</th>
                  <th className="px-6 py-3.5 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map(([name, v]) => (
                  <tr key={name} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{name}</p>
                      <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${Math.max(4, Math.round((v.paise / maxPaise) * 100))}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-slate-700">{v.orders}</td>
                    <td className="px-6 py-4 text-right font-medium tabular-nums text-slate-900">
                      {inr.format(v.paise / 100)}
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <EmptyRow cols={3} title="No sales yet" text="Paid orders from your district's partners appear here." />
                )}
              </tbody>
            </table>
          </Card>
        </div>

        <Card title="Recent orders">
          <ul className="divide-y divide-slate-100">
            {orders.slice(0, 6).map((o) => (
              <li key={o.id} className="flex items-center gap-3 px-6 py-4">
                <Avatar name={o.student.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{o.student.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {o.course.name} · {dateFmt.format(o.createdAt)}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums text-slate-900">
                  {inr.format(Number(o.amount))}
                </span>
              </li>
            ))}
            {orders.length === 0 && (
              <li className="px-6 py-12 text-center text-sm text-slate-500">No orders yet.</li>
            )}
          </ul>
        </Card>
      </div>
    </>
  );
}

export default function DistrictOverviewPage() {
  return (
    <>
      <PageHeader
        title="District Overview"
        subtitle="Sales, partners and earnings for your district. You can only see records in this district."
      />
      <Suspense fallback={<PageSkeleton />}>
        <Overview />
      </Suspense>
    </>
  );
}