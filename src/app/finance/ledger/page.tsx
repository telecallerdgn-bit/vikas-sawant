import { Suspense } from "react";
import { Coins, ListChecks, Receipt } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PAYEE_TYPES, requireFinance, typeLabel } from "@/lib/finance";
import {
  Card,
  Chip,
  Empty,
  FinanceHeader,
  Pager,
  StatCard,
  TH,
  THEAD,
  fmtDateTime,
  inr,
  qs,
} from "@/components/finance/ui";

const PAGE_SIZE = 30;

type SearchParams = Promise<{ type?: string; page?: string }>;

async function View({ searchParams }: { searchParams: SearchParams }) {
  await requireFinance();

  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const typeGroups = await prisma.ledgerEntry.groupBy({ by: ["type"], _count: { _all: true } });
  const type = typeGroups.find((g) => g.type === sp.type)?.type;
  const where = type ? { type } : {};

  const [entries, total, payees, fees] = await Promise.all([
    prisma.ledgerEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { name: true } } },
    }),
    prisma.ledgerEntry.count({ where }),
    prisma.ledgerEntry.aggregate({ where: { type: { in: PAYEE_TYPES } }, _sum: { amount: true } }),
    prisma.ledgerEntry.aggregate({ where: { type: { in: ["GST", "GATEWAY_FEE"] } }, _sum: { amount: true } }),
  ]);

  const all = typeGroups.reduce((a, g) => a + g._count._all, 0);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Entries" value={String(all)} sub="All ledger entries" icon={ListChecks} tone="purple" />
        <StatCard
          label="Credited to payees"
          value={inr.format(Number(payees._sum.amount ?? 0))}
          sub="Partner, district and sub super"
          icon={Coins}
          tone="green"
        />
        <StatCard
          label="GST and gateway fees"
          value={inr.format(Number(fees._sum.amount ?? 0))}
          sub="Deducted before commission"
          icon={Receipt}
          tone="cyan"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip href="/finance/ledger" active={!type}>
          All <span className="opacity-70">({all})</span>
        </Chip>
        {typeGroups.map((g) => (
          <Chip key={g.type} href={qs("/finance/ledger", { type: g.type })} active={type === g.type}>
            {typeLabel(g.type)} <span className="opacity-70">({g._count._all})</span>
          </Chip>
        ))}
      </div>

      <Card title="Commission ledger" badge={`${total} ${type ? "shown" : "total"}`}>
        {entries.length === 0 ? (
          <Empty title="No ledger entries yet." text="Entries are written when a paid order is split." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={THEAD}>
                <tr>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className={TH}>Order</th>
                  <th className={TH}>Payee</th>
                  <th className={TH}>Type</th>
                  <th className={`${TH} text-right`}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">{fmtDateTime.format(e.createdAt)}</td>
                    <td className="px-4 py-3.5 font-mono">{e.orderId ? `#${e.orderId}` : "—"}</td>
                    <td className="px-4 py-3.5 text-slate-800">{e.user?.name ?? <span className="text-slate-400">Platform</span>}</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{typeLabel(e.type)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono lining-nums">{inr.format(Number(e.amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pager base="/finance/ledger" params={{ type }} page={page} pages={pages} />
    </div>
  );
}

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="space-y-6">
      <FinanceHeader title="Commission Ledger" subtitle="Every rupee credited from paid orders. Read-only." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View searchParams={searchParams} />
      </Suspense>
    </div>
  );
}