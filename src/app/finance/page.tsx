import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Coins, CreditCard, Receipt, RotateCcw, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PAYEE_TYPES, requireFinance, typeLabel } from "@/lib/finance";
import { Card, Empty, FinanceHeader, StatCard, TH, THEAD, inr } from "@/components/finance/ui";

async function Overview() {
  await requireFinance();

  const [gross, refunded, gst, gateway, credited, paidOut, inProgress, byType] = await Promise.all([
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: { _all: true } }),
    prisma.order.aggregate({ where: { status: "REFUNDED" }, _sum: { amount: true }, _count: { _all: true } }),
    prisma.ledgerEntry.aggregate({ where: { type: "GST" }, _sum: { amount: true } }),
    prisma.ledgerEntry.aggregate({ where: { type: "GATEWAY_FEE" }, _sum: { amount: true } }),
    prisma.ledgerEntry.aggregate({ where: { type: { in: PAYEE_TYPES } }, _sum: { amount: true } }),
    prisma.payout.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.payout.aggregate({
      where: { status: { in: ["REQUESTED", "APPROVED"] } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.ledgerEntry.groupBy({ by: ["type"], _sum: { amount: true } }),
  ]);

  const n = (v: unknown) => Number(v ?? 0);
  const owed = n(credited._sum.amount) - n(paidOut._sum.amount);

  const tiers = byType
    .map((t) => ({ type: t.type, amount: n(t._sum.amount) }))
    .sort((a, b) => b.amount - a.amount);
  const tiersTotal = tiers.reduce((a, t) => a + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Collected (gross)"
          value={inr.format(n(gross._sum.amount))}
          sub={`${gross._count._all} paid orders`}
          icon={Coins}
          tone="blue"
        />
        <StatCard label="GST collected" value={inr.format(n(gst._sum.amount))} sub="Recorded in ledger" icon={Receipt} tone="purple" />
        <StatCard
          label="Gateway fees"
          value={inr.format(n(gateway._sum.amount))}
          sub="Recorded in ledger"
          icon={CreditCard}
          tone="cyan"
        />
        <StatCard
          label="Commission owed to payees"
          value={inr.format(owed)}
          sub="Credited minus paid out"
          icon={Wallet}
          tone="green"
        />
        <StatCard
          label="Payouts in progress"
          value={inr.format(n(inProgress._sum.amount))}
          sub={`${inProgress._count._all} request${inProgress._count._all === 1 ? "" : "s"}`}
          icon={Clock}
          tone="orange"
        />
        <StatCard
          label="Refunded"
          value={inr.format(n(refunded._sum.amount))}
          sub={`${refunded._count._all} order${refunded._count._all === 1 ? "" : "s"}`}
          icon={RotateCcw}
          tone="rose"
        />
      </div>

      <Card title="Distribution across tiers (all time)" badge={`${tiers.length} tiers`}>
        {tiers.length === 0 ? (
          <Empty
            title="Nothing distributed yet."
            text="Amounts appear here once paid orders are split into GST, fees, commission and residual."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={THEAD}>
                <tr>
                  <th className="px-5 py-3 font-semibold">Tier</th>
                  <th className={`${TH} text-right`}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((t) => (
                  <tr key={t.type} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 text-slate-800">{typeLabel(t.type)}</td>
                    <td className="px-4 py-3.5 text-right font-mono lining-nums">{inr.format(t.amount)}</td>
                  </tr>
                ))}
                <tr className="border-t border-slate-200 bg-slate-50">
                  <td className="px-5 py-3.5 font-semibold text-slate-900">Total</td>
                  <td className="px-4 py-3.5 text-right font-mono font-semibold lining-nums">{inr.format(tiersTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-slate-100 px-5 py-3 text-right">
          <Link
            href="/finance/ledger"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
          >
            Open the ledger <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function FinanceOverviewPage() {
  return (
    <div className="space-y-6">
      <FinanceHeader title="Financial Overview" subtitle="Collections, fees, commission and payouts at a glance." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <Overview />
      </Suspense>
    </div>
  );
}