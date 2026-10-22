import { Suspense } from "react";
import { Coins, GraduationCap, Ticket, UserMinus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStudentAdmin } from "@/lib/sadmin-auth";
import { Avatar, Card, Empty, Pill, SAHeader, StatCard, TH, THEAD, inr } from "@/components/studentadmin/ui";

async function View() {
  await requireStudentAdmin();

  const [partners, sales, direct] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PARTNER" },
      select: {
        id: true,
        name: true,
        referralCode: true,
        isActive: true,
        district: { select: { name: true } },
        _count: { select: { students: true } },
      },
      take: 200,
    }),
    prisma.order.groupBy({
      by: ["partnerId"],
      where: { status: "PAID", partnerId: { not: null } },
      _count: { _all: true },
      _sum: { amount: true },
    }),
    prisma.student.count({ where: { partnerId: null } }),
  ]);

  const salesMap = new Map(
    sales.map((s) => [s.partnerId as number, { orders: s._count._all, amount: Number(s._sum.amount ?? 0) }])
  );

  const rows = partners
    .map((p) => ({ ...p, orders: salesMap.get(p.id)?.orders ?? 0, amount: salesMap.get(p.id)?.amount ?? 0 }))
    .sort((a, b) => b._count.students - a._count.students || b.amount - a.amount);

  const referred = rows.reduce((a, p) => a + p._count.students, 0);
  const referredSales = rows.reduce((a, p) => a + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Partner codes" value={String(rows.length)} sub="Partners with a code" icon={Ticket} tone="blue" />
        <StatCard label="Referred students" value={String(referred)} sub="Joined through a partner" icon={GraduationCap} tone="purple" />
        <StatCard label="Direct students" value={String(direct)} sub="Joined without a code" icon={UserMinus} tone="orange" />
        <StatCard label="Sales via partners" value={inr.format(referredSales)} sub="Paid orders" icon={Coins} tone="green" />
      </div>

      <Card title="Reference codes" badge={`${rows.length} partners`}>
        {rows.length === 0 ? (
          <Empty title="No partners yet." text="Partner codes appear here once partners are active." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={THEAD}>
                <tr>
                  <th className="px-5 py-3 font-semibold">Partner</th>
                  <th className={TH}>Code</th>
                  <th className={TH}>District</th>
                  <th className={`${TH} text-right`}>Students</th>
                  <th className={`${TH} text-right`}>Paid orders</th>
                  <th className={`${TH} text-right`}>Paid sales</th>
                  <th className={TH}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.name} />
                        <span className="font-semibold text-slate-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {p.referralCode ? (
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-700">
                          {p.referralCode}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{p.district?.name ?? "—"}</td>
                    <td className="px-4 py-4 text-right font-medium lining-nums">{p._count.students}</td>
                    <td className="px-4 py-4 text-right lining-nums">{p.orders}</td>
                    <td className="px-4 py-4 text-right font-mono lining-nums">{inr.format(p.amount)}</td>
                    <td className="px-4 py-4">
                      <Pill cls={p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                        {p.isActive ? "Active" : "Suspended"}
                      </Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function ReferralsPage() {
  return (
    <div className="space-y-6">
      <SAHeader title="Reference Codes" subtitle="Which partner brought how many students and sales. Read-only." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View />
      </Suspense>
    </div>
  );
}