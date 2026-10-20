import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import Icon, { type IconName } from "@/components/icons";

const BASE = "/admin/audit";
const PAGE_SIZE = 25;
const RISKY = /blocked|failed|denied|rejected/i;

const dateFmt = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" });
const timeFmt = new Intl.DateTimeFormat("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
});
const fullFmt = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "full",
  timeStyle: "medium",
  timeZone: "Asia/Kolkata",
});

// Tailwind ko poori class chahiye, isliye rang yahan literal likhe hain
const TONES = {
  blue: { card: "border-blue-100 bg-blue-50/60", icon: "bg-blue-500", label: "text-blue-700" },
  green: { card: "border-emerald-100 bg-emerald-50/60", icon: "bg-emerald-500", label: "text-emerald-700" },
  red: { card: "border-red-100 bg-red-50/60", icon: "bg-red-500", label: "text-red-700" },
  violet: { card: "border-violet-100 bg-violet-50/60", icon: "bg-violet-500", label: "text-violet-700" },
} as const;

function initials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
}

function href(action?: string, page?: number) {
  const q = new URLSearchParams();
  if (action) q.set("action", action);
  if (page && page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `${BASE}?${s}` : BASE;
}

type SearchParams = Promise<{ action?: string; page?: string }>;

async function AuditView({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  // The filter list is built from the actions that really exist in the database.
  const actions = await prisma.auditLog.groupBy({
    by: ["action"],
    _count: { _all: true },
    orderBy: { action: "asc" },
  });
  const action = actions.find((a) => a.action === sp.action)?.action;
  const where = action ? { action } : {};

  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [logs, total, recent] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.count({ where: { createdAt: { gte: last24h } } }),
  ]);

  // AuditLog has no relation to User, so names are looked up separately.
  const ids = [...new Set(logs.map((l) => l.userId).filter((id): id is number => id !== null))];
  const users = ids.length
    ? await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } })
    : [];
  const names = new Map(users.map((u) => [u.id, u.name]));

  const allCount = actions.reduce((a, x) => a + x._count._all, 0);
  const flagged = actions.filter((a) => RISKY.test(a.action)).reduce((a, x) => a + x._count._all, 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const cards: { label: string; value: string; note: string; tone: keyof typeof TONES; icon: IconName }[] = [
    { label: "Total entries", value: allCount.toLocaleString("en-IN"), note: "Since logging began", tone: "blue", icon: "info" },
    { label: "Last 24 hours", value: recent.toLocaleString("en-IN"), note: "Recent activity", tone: "green", icon: "clock" },
    {
      label: "Flagged",
      value: flagged.toLocaleString("en-IN"),
      note: flagged > 0 ? "Blocked, failed, denied or rejected" : "Nothing suspicious",
      tone: "red",
      icon: "info",
    },
    { label: "Action types", value: actions.length.toLocaleString("en-IN"), note: "Distinct actions recorded", tone: "violet", icon: "check" },
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const t = TONES[c.tone];
          return (
            <div key={c.label} className={`rounded-2xl border p-5 ${t.card}`}>
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${t.icon}`}>
                  <Icon name={c.icon} className="h-5 w-5" />
                </span>
                <span className={`text-sm font-semibold uppercase tracking-wide ${t.label}`}>{c.label}</span>
              </div>
              <p className="mt-4 text-3xl font-bold tabular-nums text-slate-900">{c.value}</p>
              <p className="mt-1 text-sm text-slate-500">{c.note}</p>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <form
        method="get"
        action={BASE}
        className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4"
      >
        <span className="text-sm font-semibold text-slate-500">Action</span>
        <select
          name="action"
          defaultValue={action ?? ""}
          aria-label="Filter by action"
          className="min-w-[220px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
        >
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a.action} value={a.action}>
              {a.action} ({a._count._all})
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Apply
        </button>
        {action && (
          <Link href={BASE} className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline">
            Clear filter
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">{action ? action : "All entries"}</h2>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {total} total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">When</th>
                <th className="px-6 py-3.5">Who</th>
                <th className="px-6 py-3.5">Action</th>
                <th className="px-6 py-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-14 text-center">
                    <p className="font-medium text-slate-700">No audit entries found</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {action ? "No entries for this action." : "Sensitive actions will be recorded here."}
                    </p>
                    {action && (
                      <Link
                        href={BASE}
                        className="mt-3 inline-block rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View all entries
                      </Link>
                    )}
                  </td>
                </tr>
              )}

              {logs.map((l) => {
                const risky = RISKY.test(l.action);
                const isSystem = l.userId === null;
                const who = isSystem ? "System" : (names.get(l.userId!) ?? `User #${l.userId}`);
                return (
                  <tr key={l.id} className="align-top transition-colors hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-6 py-4" title={fullFmt.format(l.createdAt)}>
                      <p className="text-slate-800">{dateFmt.format(l.createdAt)}</p>
                      <p className="text-xs text-slate-400">{timeFmt.format(l.createdAt)}</p>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            isSystem ? "bg-slate-200 text-slate-600" : "bg-blue-600 text-white"
                          }`}
                          aria-hidden="true"
                        >
                          {isSystem ? "SY" : initials(who)}
                        </span>
                        <span className={`font-medium ${isSystem ? "text-slate-500" : "text-slate-900"}`}>{who}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          risky ? "bg-red-100 text-red-700" : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {l.action}
                      </span>
                    </td>

                    <td className="max-w-md break-words px-6 py-4 text-slate-700">
                      {l.details ?? <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer / pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
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
                  href={href(action, page - 1)}
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
                  href={href(action, page + 1)}
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
      </div>
    </div>
  );
}

function AuditSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[132px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="h-16 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}

export default function AuditPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Super Admin</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Audit Log</h1>
        <p className="mt-1 text-sm text-slate-500">
          Every sensitive action is recorded here. This page is read-only.
        </p>
      </header>
      <Suspense fallback={<AuditSkeleton />}>
        <AuditView searchParams={searchParams} />
      </Suspense>
    </div>
  );
}