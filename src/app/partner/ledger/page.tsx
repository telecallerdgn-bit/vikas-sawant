import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, getWallet, parsePage, requirePartner } from "@/lib/partner";
import { formatDate, formatInr, formatInrShort, formatTime, toRupees } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import StatCards, { type Stat } from "@/components/ui/StatCards";
import TableCard, { EmptyRow, TH, THEAD } from "@/components/ui/TableCard";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import Note from "@/components/ui/Note";
import { PageSkeleton } from "@/components/ui/Skeletons";

type SearchParams = Promise<{ page?: string }>;

async function LedgerView({ searchParams }: { searchParams: SearchParams }) {
  const me = await requirePartner();
  const page = parsePage((await searchParams).page);
  const where = { userId: me.id };

  const [wallet, entries, total] = await Promise.all([
    getWallet(me.id),
    prisma.ledgerEntry.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.ledgerEntry.count({ where }),
  ]);

  const stats: Stat[] = [
    { label: "Wallet balance", value: formatInrShort(wallet.balance), hint: "All entries combined", icon: "wallet", tone: "violet" },
    { label: "Available now", value: formatInrShort(wallet.available), hint: "Ready to withdraw", icon: "rupee", tone: "emerald" },
    { label: "On hold", value: formatInrShort(wallet.hold), hint: "Earned in the last 15 days", icon: "clock", tone: "orange" },
  ];

  return (
    <div className="space-y-6">
      <StatCards items={stats} cols={3} />

      <TableCard
        title="Wallet entries"
        count={total}
        footer={<Pagination basePath="/partner/ledger" page={page} total={total} pageSize={PAGE_SIZE} noun="entries" />}
      >
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className={THEAD}>
            <tr>
              <th className={TH}>Date</th>
              <th className={TH}>Type</th>
              <th className={TH}>Reference</th>
              <th className={`${TH} text-right`}>Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.length === 0 && <EmptyRow colSpan={4} title="No wallet entries yet" />}
            {entries.map((e) => {
              const amount = toRupees(e.amount);
              const ref = e.orderId ? `Order #${e.orderId}` : e.payoutId ? `Payout #${e.payoutId}` : null;
              return (
                <tr key={e.id} className="transition-colors hover:bg-blue-50/40">
                  <td className="px-6 py-4">
                    <p className="text-slate-800">{formatDate(e.createdAt)}</p>
                    <p className="text-xs text-slate-400">{formatTime(e.createdAt)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge value={e.type} />
                  </td>
                  <td className="px-6 py-4">
                    {ref ? (
                      <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">{ref}</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
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

      <Note>The ledger is a permanent record. Entries are never edited or deleted. Corrections appear as new entries.</Note>
    </div>
  );
}

export default function LedgerPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Wallet Ledger" description="Every credit and debit in your wallet, newest first." />
      <Suspense fallback={<PageSkeleton cards={3} />}>
        <LedgerView searchParams={searchParams} />
      </Suspense>
    </div>
  );
}