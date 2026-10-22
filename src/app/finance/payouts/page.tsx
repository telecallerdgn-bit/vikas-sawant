import { Suspense } from "react";
import type { PayoutStatus } from "@prisma/client";
import { CheckCircle2, Clock, Info, ThumbsUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireFinance } from "@/lib/finance";
import PayoutActions from "@/components/finance/PayoutActions";
import {
  Avatar,
  Card,
  Chip,
  Empty,
  FinanceHeader,
  PAYOUT_PILL,
  Pager,
  Pill,
  StatCard,
  TH,
  THEAD,
  fmtDate,
  inr,
  qs,
} from "@/components/finance/ui";

const PAGE_SIZE = 20;
const STATUSES: PayoutStatus[] = ["REQUESTED", "APPROVED", "PAID", "REJECTED"];

type SearchParams = Promise<{ status?: string; page?: string }>;

async function View({ searchParams }: { searchParams: SearchParams }) {
  const me = await requireFinance();

  const sp = await searchParams;
  const status = STATUSES.find((s) => s === sp.status);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const where = status ? { status } : {};

  const [payouts, total, grouped] = await Promise.all([
    prisma.payout.findMany({
      where,
      orderBy: { requestedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { name: true, mobile: true, district: { select: { name: true } } } } },
    }),
    prisma.payout.count({ where }),
    prisma.payout.groupBy({ by: ["status"], _count: { _all: true }, _sum: { amount: true } }),
  ]);

  const counts: Record<string, number> = {};
  const sums: Record<string, number> = {};
  for (const g of grouped) {
    counts[g.status] = g._count._all;
    sums[g.status] = Number(g._sum.amount ?? 0);
  }
  const all = Object.values(counts).reduce((a, b) => a + b, 0);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const tabs = [
    { label: "All", value: undefined as string | undefined, count: all },
    ...STATUSES.map((s) => ({ label: PAYOUT_PILL[s].label, value: s as string | undefined, count: counts[s] ?? 0 })),
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Waiting for approval"
          value={inr.format(sums.REQUESTED ?? 0)}
          sub={`${counts.REQUESTED ?? 0} request${(counts.REQUESTED ?? 0) === 1 ? "" : "s"}`}
          icon={Clock}
          tone="orange"
        />
        <StatCard
          label="Approved, ready to pay"
          value={inr.format(sums.APPROVED ?? 0)}
          sub={`${counts.APPROVED ?? 0} request${(counts.APPROVED ?? 0) === 1 ? "" : "s"}`}
          icon={ThumbsUp}
          tone="blue"
        />
        <StatCard
          label="Paid out"
          value={inr.format(sums.PAID ?? 0)}
          sub={`${counts.PAID ?? 0} payment${(counts.PAID ?? 0) === 1 ? "" : "s"}`}
          icon={CheckCircle2}
          tone="green"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Chip key={t.label} href={qs("/finance/payouts", { status: t.value })} active={(t.value ?? "") === (status ?? "")}>
            {t.label} <span className="opacity-70">({t.count})</span>
          </Chip>
        ))}
      </div>

      <Card title="Payout requests" badge={`${total} ${status ? "shown" : "total"}`}>
        {payouts.length === 0 ? (
          <Empty title="No payout requests." text="Partner withdrawal requests appear here for review." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={THEAD}>
                <tr>
                  <th className="px-5 py-3 font-semibold">Request</th>
                  <th className={TH}>Partner</th>
                  <th className={TH}>District</th>
                  <th className={`${TH} text-right`}>Amount</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>UTR</th>
                  <th className={TH}>Requested</th>
                  <th className={TH}>Action</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 align-top hover:bg-slate-50/60">
                    <td className="px-5 py-4 font-mono">#{p.id}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.user.name} />
                        <div>
                          <p className="font-semibold text-slate-900">{p.user.name}</p>
                          <p className="text-xs text-slate-500">{p.user.mobile ?? "No mobile"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{p.user.district?.name ?? "—"}</td>
                    <td className="px-4 py-4 text-right font-mono lining-nums">{inr.format(Number(p.amount))}</td>
                    <td className="px-4 py-4">
                      <Pill cls={PAYOUT_PILL[p.status].cls}>{PAYOUT_PILL[p.status].label}</Pill>
                      {p.status === "REJECTED" && p.note && (
                        <p className="mt-1 max-w-[12rem] text-xs text-red-600">{p.note}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs">{p.utr ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-500">{fmtDate.format(p.requestedAt)}</td>
                    <td className="px-4 py-4">
                      {p.userId === me.id ? (
                        <span className="text-xs text-slate-400">Your own payout</span>
                      ) : (
                        <PayoutActions
                          id={p.id}
                          status={p.status}
                          amount={inr.format(Number(p.amount))}
                          name={p.user.name}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pager base="/finance/payouts" params={{ status }} page={page} pages={pages} />

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
        <Info className="mt-0.5 h-[18px] w-[18px] shrink-0 text-amber-600" />
        <p>
          A payout must be approved before it can be marked paid. Bank details are not stored in the system yet, so
          send the money from your own records and enter the bank reference (UTR) here. The partner is notified.
        </p>
      </div>
    </div>
  );
}

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="space-y-6">
      <FinanceHeader title="Payout Requests" subtitle="Review withdrawals, approve them and record the payment." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View searchParams={searchParams} />
      </Suspense>
    </div>
  );
}