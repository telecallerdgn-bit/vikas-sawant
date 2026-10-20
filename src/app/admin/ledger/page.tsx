import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import Icon, { type IconName } from "@/components/icons";

const BASE = "/admin/ledger";
const PAGE_SIZE = 25;

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
const dateFmt = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" });
const timeFmt = new Intl.DateTimeFormat("en-IN", { timeStyle: "short", timeZone: "Asia/Kolkata" });
const dateTimeFmt = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
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

function href(type?: string, page?: number) {
  const q = new URLSearchParams();
  if (type) q.set("type", type);
  if (page && page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `${BASE}?${s}` : BASE;
}

function label(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase().replaceAll("_", " ");
}

// Badge colour is chosen from the type name. Unknown types stay grey.
function typeStyle(type: string) {
  const t = type.toUpperCase();
  if (t.includes("COMMISSION") || t.includes("CREDIT") || t.includes("BONUS"))
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (t.includes("PAYOUT") || t.includes("WITHDRAW"))
    return "bg-blue-50 text-blue-700 ring-blue-200";
  if (t.includes("REFUND") || t.includes("REVERSAL") || t.includes("CLAWBACK") || t.includes("DEBIT"))
    return "bg-red-50 text-red-700 ring-red-200";
  return "bg-slate-100 text-slate-600 ring-slate-200";
}

function initials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
}

type SearchParams = Promise<{ type?: string; page?: string }>;

async function LedgerView({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  // Tabs are built from the types that actually exist in the database.
  const grouped = await prisma.ledgerEntry.groupBy({
    by: ["type"],
    _count: { _all: true },
    _sum: { amount: true },
    orderBy: { type: "asc" },
  });

  const type = grouped.find((g) => g.type === sp.type)?.type;
  const where = type ? { type } : {};

  const [entries, total, last, moneyIn, moneyOut] = await Promise.all([
    prisma.ledgerEntry.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { name: true } },
      },
    }),
    prisma.ledgerEntry.count({ where }),
    prisma.ledgerEntry.findFirst({
      where,
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.ledgerEntry.aggregate({ where: { ...where, amount: { gt: 0 } }, _sum: { amount: true } }),
    prisma.ledgerEntry.aggregate({ where: { ...where, amount: { lt: 0 } }, _sum: { amount: true } }),
  ]);

  const allCount = grouped.reduce((a, g) => a + g._count._all, 0);
  // Sum in whole paise to avoid floating point errors.
  const toPaise = (v: unknown) => Math.round(Number(v ?? 0) * 100);
  const scoped = type ? grouped.filter((g) => g.type === type) : grouped;
  const net = scoped.reduce((a, g) => a + toPaise(g._sum.amount), 0) / 100;
  const inAmount = toPaise(moneyIn._sum.amount) / 100;
  const outAmount = toPaise(moneyOut._sum.amount) / 100;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const stats: Stat[] = [
    {
      label: "Entries",
      value: total.toLocaleString("en-IN"),
      hint: last ? `Latest: ${dateTimeFmt.format(last.createdAt)}` : type ? label(type) : "All types",
      icon: "book",
      tone: "blue",
    },
    {
      label: "Money in",
      value: inrShort.format(inAmount),
      hint: "Positive amounts",
      icon: "trending",
      tone: "emerald",
    },
    {
      label: "Money out",
      value: inrShort.format(outAmount),
      hint: "Negative amounts",
      icon: "wallet",
      tone: "orange",
    },
    {
      label: "Net balance",
      value: inrShort.format(net),
      hint: "Sum of amounts as stored",
      icon: "rupee",
      tone: "violet",
    },
  ];

  const tabs = [
    { label: "All", value: undefined as string | undefined, count: allCount },
    ...grouped.map((g) => ({
      label: label(g.type),
      value: g.type as string | undefined,
      count: g._count._all,
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

      {/* Type tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = (t.value ?? "") === (type ?? "");
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
            {type ? `${label(type)} entries` : "All entries"}
          </h2>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {total} total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Entry</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Partner</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Order</th>
                <th className="px-6 py-3.5">Payout</th>
                <th className="px-6 py-3.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <p className="font-medium text-slate-700">No ledger entries found</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {type
                        ? "No entries of this type yet."
                        : "Wallet entries will appear here as orders and payouts happen."}
                    </p>
                    {type && (
                      <Link
                        href={href()}
                        className="mt-3 inline-block rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View all entries
                      </Link>
                    )}
                  </td>
                </tr>
              )}

              {entries.map((e) => {
                const amount = Number(e.amount);
                return (
                  <tr key={e.id} className="align-middle transition-colors hover:bg-blue-50/40">
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                        #{e.id}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-slate-800">{dateFmt.format(e.createdAt)}</p>
                      <p className="text-xs text-slate-400">{timeFmt.format(e.createdAt)}</p>
                    </td>

                    <td className="px-6 py-4">
                      {e.user?.name ? (
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700"
                            aria-hidden="true"
                          >
                            {initials(e.user.name)}
                          </span>
                          <span className="font-semibold text-slate-900">{e.user.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${typeStyle(
                          e.type,
                        )}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {label(e.type)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {e.orderId ? (
                        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                          #{e.orderId}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {e.payoutId ? (
                        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                          #{e.payoutId}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    <td
                      className={`px-6 py-4 text-right font-semibold tabular-nums ${
                        amount < 0 ? "text-red-600" : amount > 0 ? "text-emerald-700" : "text-slate-400"
                      }`}
                    >
                      {amount > 0 ? "+" : ""}
                      {inr.format(amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer / pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-3.5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {from}–{to} of {total} entries
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs">
                Page {page} of {totalPages}
              </span>
              {page > 1 ? (
                <Link
                  href={href(type, page - 1)}
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
                  href={href(type, page + 1)}
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
          This page is read-only. Amounts are shown as stored: positive amounts add to a wallet and
          negative amounts reduce it.
        </p>
      </div>
    </div>
  );
}

function LedgerSkeleton() {
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

export default function LedgerPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Super Admin</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Financial Ledger</h1>
        <p className="mt-1 text-sm text-slate-500">
          Every wallet entry across orders and payouts, newest first.
        </p>
      </header>

      <Suspense fallback={<LedgerSkeleton />}>
        <LedgerView searchParams={searchParams} />
      </Suspense>
    </div>
  );
}