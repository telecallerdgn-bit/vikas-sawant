import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getDistrictContext } from "@/lib/district";
import {
  Badge,
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

const STATUS_STYLES: Record<string, string> = {
  REQUESTED: "bg-amber-100 text-amber-800",
  APPROVED: "bg-blue-100 text-blue-800",
  PAID: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-700",
};

async function Withdrawals() {
  const { session, district } = await getDistrictContext();
  if (!district) return <NoDistrict />;

  const userId = session.userId;
  const [payouts, grouped, wallet] = await Promise.all([
    prisma.payout.findMany({ where: { userId }, orderBy: { requestedAt: "desc" }, take: 50 }),
    prisma.payout.groupBy({ by: ["status"], where: { userId }, _sum: { amount: true } }),
    prisma.ledgerEntry.aggregate({ where: { userId }, _sum: { amount: true } }),
  ]);

  const sum = (s: string) => Number(grouped.find((g) => g.status === s)?._sum.amount ?? 0);
  const pending = sum("REQUESTED") + sum("APPROVED");

  return (
    <>
      <Cards>
        <StatCard label="Wallet balance" value={inr.format(Number(wallet._sum.amount ?? 0))} note="Available to withdraw" tone="blue" icon="rupee" />
        <StatCard label="Pending" value={inr.format(pending)} note="Requested or approved" tone="amber" icon="clock" />
        <StatCard label="Paid so far" value={inr.format(sum("PAID"))} note="Settled withdrawals" tone="green" icon="check" />
        <StatCard label="Requests" value={String(payouts.length)} note="All time" tone="violet" icon="info" />
      </Cards>

      <Card title="Withdrawals" total={payouts.length}>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className={THEAD}>
            <tr>
              <th className="px-6 py-3.5">Payout</th>
              <th className="px-6 py-3.5 text-right">Amount</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">UTR</th>
              <th className="px-6 py-3.5">Requested</th>
              <th className="px-6 py-3.5">Paid</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payouts.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-slate-50/70">
                <td className="px-6 py-4">
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">#{p.id}</span>
                </td>
                <td className="px-6 py-4 text-right font-medium tabular-nums text-slate-900">
                  {inr.format(Number(p.amount))}
                </td>
                <td className="px-6 py-4">
                  <Badge cls={STATUS_STYLES[p.status] ?? "bg-slate-100 text-slate-700"}>
                    {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                  </Badge>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-700">
                  {p.utr ?? <span className="text-slate-300">—</span>}
                </td>
                <td className="px-6 py-4 text-slate-700">{dateFmt.format(p.requestedAt)}</td>
                <td className="px-6 py-4 text-slate-700">
                  {p.paidAt ? dateFmt.format(p.paidAt) : <span className="text-slate-300">—</span>}
                </td>
              </tr>
            ))}
            {payouts.length === 0 && (
              <EmptyRow cols={6} title="No withdrawals yet" text="Your withdrawal requests and their status appear here." />
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}

export default function DistrictWithdrawalsPage() {
  return (
    <>
      <PageHeader title="Withdrawals" subtitle="Your wallet withdrawal requests and their payment status." />
      <Suspense fallback={<PageSkeleton />}>
        <Withdrawals />
      </Suspense>
    </>
  );
}