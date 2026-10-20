import { Suspense } from "react";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getDistrictContext } from "@/lib/district";
import {
  Avatar,
  Badge,
  Card,
  Cards,
  EmptyRow,
  NoDistrict,
  PageHeader,
  PageSkeleton,
  StatCard,
  THEAD,
  inr,
} from "@/components/district/ui";

async function Partners() {
  const { district } = await getDistrictContext();
  if (!district) return <NoDistrict />;

  const [partners, orders] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PARTNER", districtId: district.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        mobile: true,
        referralCode: true,
        isActive: true,
        _count: { select: { students: true, children: true } },
      },
    }),
    prisma.order.findMany({
      where: { status: OrderStatus.PAID, partner: { districtId: district.id } },
      select: { amount: true, partner: { select: { id: true } } },
    }),
  ]);

  const salesPaise = new Map<number, number>();
  for (const o of orders) {
    const id = o.partner?.id;
    if (id !== undefined) salesPaise.set(id, (salesPaise.get(id) ?? 0) + Math.round(Number(o.amount) * 100));
  }

  const active = partners.filter((p) => p.isActive).length;
  const students = partners.reduce((a, p) => a + p._count.students, 0);
  const totalSales = [...salesPaise.values()].reduce((a, b) => a + b, 0) / 100;

  return (
    <>
      <Cards>
        <StatCard label="Total partners" value={String(partners.length)} note="In your district" tone="blue" icon="info" />
        <StatCard label="Active" value={String(active)} note={`${partners.length - active} suspended`} tone="green" icon="check" />
        <StatCard label="Students" value={String(students)} note="Brought in by partners" tone="violet" icon="trending" />
        <StatCard label="Partner sales" value={inr.format(totalSales)} note="Paid orders only" tone="amber" icon="rupee" />
      </Cards>

      <Card title="Business partners" total={partners.length}>
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className={THEAD}>
            <tr>
              <th className="px-6 py-3.5">Partner</th>
              <th className="px-6 py-3.5">Referral code</th>
              <th className="px-6 py-3.5 text-right">Referrals</th>
              <th className="px-6 py-3.5 text-right">Students</th>
              <th className="px-6 py-3.5 text-right">Sales</th>
              <th className="px-6 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {partners.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-slate-50/70">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.name} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{p.name}</p>
                      {p.mobile && <p className="text-xs text-slate-500">{p.mobile}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {p.referralCode ? (
                    <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                      {p.referralCode}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right tabular-nums text-slate-700">{p._count.children}</td>
                <td className="px-6 py-4 text-right tabular-nums text-slate-700">{p._count.students}</td>
                <td className="px-6 py-4 text-right font-medium tabular-nums text-slate-900">
                  {inr.format((salesPaise.get(p.id) ?? 0) / 100)}
                </td>
                <td className="px-6 py-4">
                  <Badge cls={p.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"}>
                    {p.isActive ? "Active" : "Suspended"}
                  </Badge>
                </td>
              </tr>
            ))}
            {partners.length === 0 && (
              <EmptyRow cols={6} title="No partners yet" text="Partners who join your district will appear here." />
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}

export default function DistrictPartnersPage() {
  return (
    <>
      <PageHeader title="Business Partners" subtitle="Partners registered in your district." />
      <Suspense fallback={<PageSkeleton />}>
        <Partners />
      </Suspense>
    </>
  );
}