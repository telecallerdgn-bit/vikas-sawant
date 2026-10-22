import { Suspense } from "react";
import { Info, RotateCcw, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireFinance } from "@/lib/finance";
import { Avatar, Card, Empty, FinanceHeader, StatCard, TH, THEAD, fmtDate, inr } from "@/components/finance/ui";

async function View() {
  await requireFinance();

  const [orders, agg] = await Promise.all([
    prisma.order.findMany({
      where: { status: "REFUNDED" },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        student: { select: { name: true } },
        course: { select: { name: true } },
        partner: { select: { name: true } },
      },
    }),
    prisma.order.aggregate({ where: { status: "REFUNDED" }, _sum: { amount: true }, _count: { _all: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Refunded orders"
          value={String(agg._count._all)}
          sub="All time"
          icon={RotateCcw}
          tone="rose"
        />
        <StatCard
          label="Amount refunded"
          value={inr.format(Number(agg._sum.amount ?? 0))}
          sub="Returned to students"
          icon={Wallet}
          tone="orange"
        />
      </div>

      <Card title="Refunded orders" badge={`${agg._count._all} total`}>
        {orders.length === 0 ? (
          <Empty title="No refunds." text="Refunded orders appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={THEAD}>
                <tr>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className={TH}>Student</th>
                  <th className={TH}>Course</th>
                  <th className={TH}>Partner</th>
                  <th className={`${TH} text-right`}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <p className="font-mono">#{o.id}</p>
                      <p className="text-xs text-slate-400">{fmtDate.format(o.createdAt)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={o.student.name} />
                        <span className="font-medium text-slate-900">{o.student.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-800">{o.course.name}</td>
                    <td className="px-4 py-4 text-slate-700">{o.partner?.name ?? "Direct"}</td>
                    <td className="px-4 py-4 text-right font-mono lining-nums">{inr.format(Number(o.amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
        <Info className="mt-0.5 h-[18px] w-[18px] shrink-0 text-amber-600" />
        <p>Refunds are sent back through the payment gateway, which is not connected yet. This page lists refunded orders only.</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="space-y-6">
      <FinanceHeader title="Refunds" subtitle="Orders that were refunded to students." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View />
      </Suspense>
    </div>
  );
}