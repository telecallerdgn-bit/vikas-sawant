import { Suspense } from "react";
import { AlertTriangle, CheckCircle2, Info, Scale } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireFinance } from "@/lib/finance";
import {
  Card,
  Chip,
  Empty,
  FinanceHeader,
  Pager,
  Pill,
  StatCard,
  TH,
  THEAD,
  fmtDate,
  inr,
  qs,
} from "@/components/finance/ui";

const PAGE_SIZE = 25;

type State = "BALANCED" | "MISMATCH" | "NOT_SPLIT";
const STATE: Record<State, { label: string; cls: string }> = {
  BALANCED: { label: "Balanced", cls: "bg-emerald-100 text-emerald-700" },
  MISMATCH: { label: "Mismatch", cls: "bg-red-100 text-red-700" },
  NOT_SPLIT: { label: "Not split yet", cls: "bg-amber-100 text-amber-800" },
};

type SearchParams = Promise<{ show?: string; page?: string }>;

async function View({ searchParams }: { searchParams: SearchParams }) {
  await requireFinance();

  const sp = await searchParams;
  const onlyIssues = sp.show === "issues";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const [orders, sums] = await Promise.all([
    prisma.order.findMany({
      where: { status: "PAID" },
      orderBy: { createdAt: "desc" },
      select: { id: true, amount: true, createdAt: true, student: { select: { name: true } } },
    }),
    prisma.ledgerEntry.groupBy({
      by: ["orderId"],
      where: { order: { status: "PAID" } },
      _sum: { amount: true },
    }),
  ]);

  const ledgerByOrder = new Map<number, number>();
  for (const s of sums) {
    if (s.orderId !== null) ledgerByOrder.set(s.orderId, Number(s._sum.amount ?? 0));
  }

  // Compare in paise to avoid floating point noise
  const rows = orders.map((o) => {
    const paid = Math.round(Number(o.amount) * 100);
    const has = ledgerByOrder.has(o.id);
    const split = Math.round((ledgerByOrder.get(o.id) ?? 0) * 100);
    const state: State = !has ? "NOT_SPLIT" : split === paid ? "BALANCED" : "MISMATCH";
    return { ...o, paid: paid / 100, split: split / 100, diff: (paid - split) / 100, state };
  });

  const balanced = rows.filter((r) => r.state === "BALANCED").length;
  const issues = rows.length - balanced;

  const visible = onlyIssues ? rows.filter((r) => r.state !== "BALANCED") : rows;
  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const slice = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Paid orders" value={String(rows.length)} sub="Checked" icon={Scale} tone="blue" />
        <StatCard label="Balanced" value={String(balanced)} sub="Ledger equals amount paid" icon={CheckCircle2} tone="green" />
        <StatCard label="Needs attention" value={String(issues)} sub="Mismatch or not split" icon={AlertTriangle} tone="orange" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip href="/finance/reconciliation" active={!onlyIssues}>
          All <span className="opacity-70">({rows.length})</span>
        </Chip>
        <Chip href={qs("/finance/reconciliation", { show: "issues" })} active={onlyIssues}>
          Needs attention <span className="opacity-70">({issues})</span>
        </Chip>
      </div>

      <Card title="Order reconciliation" badge={`${visible.length} shown`}>
        {slice.length === 0 ? (
          <Empty
            title={onlyIssues ? "Everything is balanced." : "No paid orders yet."}
            text="Each paid order should have ledger entries that add up to exactly what the student paid."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={THEAD}>
                <tr>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className={TH}>Student</th>
                  <th className={`${TH} text-right`}>Student paid</th>
                  <th className={`${TH} text-right`}>Ledger total</th>
                  <th className={`${TH} text-right`}>Difference</th>
                  <th className={TH}>Result</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <p className="font-mono">#{r.id}</p>
                      <p className="text-xs text-slate-400">{fmtDate.format(r.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-800">{r.student.name}</td>
                    <td className="px-4 py-3.5 text-right font-mono lining-nums">{inr.format(r.paid)}</td>
                    <td className="px-4 py-3.5 text-right font-mono lining-nums">{inr.format(r.split)}</td>
                    <td
                      className={`px-4 py-3.5 text-right font-mono lining-nums ${
                        r.diff === 0 ? "text-slate-400" : "text-red-600"
                      }`}
                    >
                      {inr.format(r.diff)}
                    </td>
                    <td className="px-4 py-3.5">
                      <Pill cls={STATE[r.state].cls}>{STATE[r.state].label}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pager base="/finance/reconciliation" params={{ show: onlyIssues ? "issues" : undefined }} page={page} pages={pages} />

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
        <Info className="mt-0.5 h-[18px] w-[18px] shrink-0 text-amber-600" />
        <p>
          &quot;Not split yet&quot; means no ledger entries exist for that paid order, so its GST, fees and commission
          have not been recorded. A mismatch means the entries add up to a different amount.
        </p>
      </div>
    </div>
  );
}

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="space-y-6">
      <FinanceHeader title="Reconciliation" subtitle="Check that every paid order is fully accounted for in the ledger." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View searchParams={searchParams} />
      </Suspense>
    </div>
  );
}