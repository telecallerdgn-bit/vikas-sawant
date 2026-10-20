import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getDistrictContext } from "@/lib/district";
import {
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

const LIMIT = 50;

function label(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase().replaceAll("_", " ");
}

async function Commissions() {
  const { session, district } = await getDistrictContext();
  if (!district) return <NoDistrict />;

  const userId = session.userId;
  const [entries, total, credits, debits] = await Promise.all([
    prisma.ledgerEntry.findMany({
      where: { userId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: LIMIT,
    }),
    prisma.ledgerEntry.count({ where: { userId } }),
    prisma.ledgerEntry.aggregate({ where: { userId, amount: { gt: 0 } }, _sum: { amount: true } }),
    prisma.ledgerEntry.aggregate({ where: { userId, amount: { lt: 0 } }, _sum: { amount: true } }),
  ]);

  const earned = Number(credits._sum.amount ?? 0);
  const deducted = Math.abs(Number(debits._sum.amount ?? 0));
  const balance = earned - deducted;

  return (
    <>
      <Cards>
        <StatCard label="Total earned" value={inr.format(earned)} note="All commission credits" tone="green" icon="trending" />
        <StatCard label="Paid out / deducted" value={inr.format(deducted)} note="Withdrawals and reversals" tone="amber" icon="rupee" />
        <StatCard label="Balance" value={inr.format(balance)} note="Earned minus deductions" tone="blue" icon="check" />
        <StatCard label="Entries" value={String(total)} note="Wallet transactions" tone="violet" icon="info" />
      </Cards>

      <Card title="Commission reports" total={total}>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className={THEAD}>
            <tr>
              <th className="px-6 py-3.5">Entry</th>
              <th className="px-6 py-3.5">Date</th>
              <th className="px-6 py-3.5">Type</th>
              <th className="px-6 py-3.5">Order</th>
              <th className="px-6 py-3.5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.map((e) => {
              const amount = Number(e.amount);
              return (
                <tr key={e.id} className="transition-colors hover:bg-slate-50/70">
                  <td className="px-6 py-4">
                    <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">#{e.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-800">{dateFmt.format(e.createdAt)}</p>
                    <p className="text-xs text-slate-400">{timeFmt.format(e.createdAt)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {label(e.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-700">
                    {e.orderId ? `#${e.orderId}` : <span className="text-slate-300">—</span>}
                  </td>
                  <td
                    className={`px-6 py-4 text-right font-medium tabular-nums ${
                      amount < 0 ? "text-red-600" : amount > 0 ? "text-emerald-700" : "text-slate-400"
                    }`}
                  >
                    {amount > 0 ? "+" : ""}
                    {inr.format(amount)}
                  </td>
                </tr>
              );
            })}
            {entries.length === 0 && (
              <EmptyRow cols={5} title="No commission yet" text="Your commission entries appear here as orders are paid." />
            )}
          </tbody>
        </table>
        {total > LIMIT && (
          <p className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
            Showing the latest {LIMIT} of {total} entries.
          </p>
        )}
      </Card>
    </>
  );
}

export default function DistrictCommissionsPage() {
  return (
    <>
      <PageHeader title="Commission Reports" subtitle="Everything credited to or deducted from your wallet." />
      <Suspense fallback={<PageSkeleton />}>
        <Commissions />
      </Suspense>
    </>
  );
}