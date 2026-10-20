import Link from "next/link";
import { Suspense } from "react";
import { PayoutStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import Icon, { type IconName } from "@/components/icons";

const PAGE_SIZE = 20;
const STATUSES = Object.values(PayoutStatus);

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});
const inrShort = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const dateFmt = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeZone: "Asia/Kolkata",
});

// Full class names are written out so Tailwind can detect them.
const TONES = {
  blue: {
    card: "border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50",
    tile: "bg-blue-500",
    label: "text-blue-700",
  },
  emerald: {
    card: "border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50",
    tile: "bg-emerald-500",
    label: "text-emerald-700",
  },
  orange: {
    card: "border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50",
    tile: "bg-orange-500",
    label: "text-orange-700",
  },
  violet: {
    card: "border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50",
    tile: "bg-violet-500",
    label: "text-violet-700",
  },
} as const;
type Tone = keyof typeof TONES;
type Stat = { label: string; value: string; hint: string; icon: IconName; tone: Tone };

const STATUS_STYLES: Record<string, string> = {
  REQUESTED: "bg-amber-50 text-amber-700 ring-amber-200",
  APPROVED: "bg-blue-50 text-blue-700 ring-blue-200",
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
};

function initials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
}

function href(status?: string, page?: number) {
  const q = new URLSearchParams();
  if (status) q.set("status", status);
  if (page && page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `/admin/payouts?${s}` : "/admin/payouts";
}

type SearchParams = Promise<{ status?: string; page?: string }>;

async function PayoutsView({ searchParams }: { searchParams: SearchParams }) {
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
      include: {
        user: { select: { name: true, district: { select: { name: true } } } },
      },
    }),
    prisma.payout.count({ where }),
    prisma.payout.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { amount: true },
    }),
  ]);

  const counts: Record<string, number> = {};
  const sums: Record<string, number> = {};
  for (const g of grouped) {
    counts[g.status] = g._count._all;
    sums[g.status] = Number(g._sum.amount ?? 0);
  }
  const allCount = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pendingCount = (counts.REQUESTED ?? 0) + (counts.APPROVED ?? 0);
  const owed = (sums.REQUESTED ?? 0) + (sums.APPROVED ?? 0);
  const paid = sums.PAID ?? 0;

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const stats: Stat[] = [
    {
      label: "Total requests",
      value: allCount.toLocaleString("en-IN"),
      hint: "All withdrawal requests",
      icon: "wallet",
      tone: "blue",
    },
    {
      label: "Pending payouts",
      value: pendingCount.toLocaleString("en-IN"),
      hint: "Requested + approved",
      icon: "clock",
      tone: "orange",
    },
    {
      label: "Amount to pay",
      value: inrShort.format(owed),
      hint: "Still owed to partners",
      icon: "rupee",
      tone: "violet",
    },
    {
      label: "Paid so far",
      value: inrShort.format(paid),
      hint: "Settled payouts",
      icon: "check",
      tone: "emerald",
    },
  ];

  const tabs = [
    { label: "All", value: undefined as string | undefined, count: allCount },
    ...STATUSES.map((s) => ({
      label: s.charAt(0) + s.slice(1).toLowerCase(),
      value: s as string | undefined,
      count: counts[s] ?? 0,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const t = TONES[s.tone];
          return (
            <div key={s.label} className={`rounded-2xl border p-4 ${t.card}`}>
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${t.tile}`}>
                  <Icon name={s.icon} className="h-5 w-5" />
                </span>
                <p className={`text-xs font-bold uppercase tracking-wide ${t.label}`}>{s.label}</p>
              </div>
              <p className="mt-4 text-3xl font-bold tabular-nums text-slate-900">{s.value}</p>
              <p className="mt-0.5 text-sm text-slate-500">{s.hint}</p>
            </div>
          );
        })}
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = (t.value ?? "") === (status ?? "");
          return (
            <Link
              key={t.label}
              href={href(t.value)}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                active
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 text-xs tabular-nums ${
                  active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {t.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">
            {status ? `${status.charAt(0) + status.slice(1).toLowerCase()} payouts` : "All payouts"}
          </h2>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {total} total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Payout</th>
                <th className="px-6 py-3.5">Partner</th>
                <th className="px-6 py-3.5">District</th>
                <th className="px-6 py-3.5 text-right">Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">UTR</th>
                <th className="px-6 py-3.5">Requested</th>
                <th className="px-6 py-3.5">Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center">
                    <p className="font-medium text-slate-700">No payouts found</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {status
                        ? "No payouts with this status yet."
                        : "Withdrawal requests from partners will appear here."}
                    </p>
                    {status && (
                      <Link
                        href={href()}
                        className="mt-3 inline-block rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View all payouts
                      </Link>
                    )}
                  </td>
                </tr>
              )}

              {payouts.map((p) => (
                <tr key={p.id} className="align-middle transition-colors hover:bg-blue-50/40">
                  <td className="px-6 py-4">
                    <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                      #{p.id}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700"
                        aria-hidden="true"
                      >
                        {initials(p.user.name)}
                      </span>
                      <span className="font-semibold text-slate-900">{p.user.name}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {p.user.district?.name ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        <Icon name="mapPin" className="h-3.5 w-3.5" />
                        {p.user.district.name}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right font-semibold tabular-nums text-slate-900">
                    {inr.format(Number(p.amount))}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                        STATUS_STYLES[p.status] ?? "bg-slate-100 text-slate-600 ring-slate-200"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {p.utr ? (
                      <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                        {p.utr}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-slate-700">{dateFmt.format(p.requestedAt)}</td>
                  <td className="px-6 py-4 text-slate-700">
                    {p.paidAt ? dateFmt.format(p.paidAt) : <span className="text-slate-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-3.5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {from}–{to} of {total} payouts
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs">
                Page {page} of {totalPages}
              </span>
              {page > 1 ? (
                <Link
                  href={href(status, page - 1)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded-lg border border-slate-100 px-3 py-1.5 font-medium text-slate-300">
                  Previous
                </span>
              )}
              {page < totalPages ? (
                <Link
                  href={href(status, page + 1)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Next
                </Link>
              ) : (
                <span className="rounded-lg border border-slate-100 px-3 py-1.5 font-medium text-slate-300">
                  Next
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Note */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-700">
        <Icon name="info" className="mt-0.5 h-[18px] w-[18px] shrink-0 text-amber-600" />
        <p>
          Amount to pay covers requested and approved withdrawals. A paid payout is settled and carries
          the bank UTR.
        </p>
      </div>
    </div>
  );
}

function PayoutsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[132px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="h-9 w-80 animate-pulse rounded-full bg-slate-100" />
      <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}

export default function PayoutsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Super Admin</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Payouts</h1>
        <p className="mt-1 text-sm text-slate-500">
          Partner withdrawal requests and their payment status, newest first.
        </p>
      </header>

      <Suspense fallback={<PayoutsSkeleton />}>
        <PayoutsView searchParams={searchParams} />
      </Suspense>
    </div>
  );
}