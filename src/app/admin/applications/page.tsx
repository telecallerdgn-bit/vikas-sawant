import Link from "next/link";
import { Suspense } from "react";
import type { LucideIcon } from "lucide-react";
import { ClipboardList, FileText, Info, Search, UserCheck, UserX, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ApplicationsTable from "@/components/ApplicationsTable";
import { DISPLAY } from "@/lib/ui";

type Card = {
  key: string;
  label: string;
  sub: string;
  icon: LucideIcon;
  card: string;
  iconBox: string;
  labelCls: string;
};

const CARDS: Card[] = [
  {
    key: "SUBMITTED",
    label: "Submitted",
    sub: "Waiting for review",
    icon: FileText,
    card: "border-sky-100 from-sky-50 to-blue-100/70",
    iconBox: "bg-blue-500 text-white",
    labelCls: "text-blue-700",
  },
  {
    key: "UNDER_REVIEW",
    label: "Under review",
    sub: "Being checked",
    icon: Search,
    card: "border-amber-100 from-amber-50 to-orange-100/70",
    iconBox: "bg-orange-500 text-white",
    labelCls: "text-orange-700",
  },
  {
    key: "MORE_INFO",
    label: "More info",
    sub: "Waiting for applicant",
    icon: ClipboardList,
    card: "border-violet-100 from-violet-50 to-purple-100/70",
    iconBox: "bg-violet-500 text-white",
    labelCls: "text-violet-700",
  },
  {
    key: "APPROVED",
    label: "Fee pending",
    sub: "Approved, fee not paid",
    icon: Wallet,
    card: "border-cyan-100 from-cyan-50 to-sky-100/70",
    iconBox: "bg-cyan-500 text-white",
    labelCls: "text-cyan-700",
  },
  {
    key: "ACTIVE",
    label: "Active partners",
    sub: "Account is live",
    icon: UserCheck,
    card: "border-emerald-100 from-emerald-50 to-green-100/70",
    iconBox: "bg-emerald-500 text-white",
    labelCls: "text-emerald-700",
  },
  {
    key: "REJECTED",
    label: "Rejected",
    sub: "Not approved",
    icon: UserX,
    card: "border-rose-100 from-rose-50 to-red-100/70",
    iconBox: "bg-rose-500 text-white",
    labelCls: "text-rose-700",
  },
];

type SearchParams = Promise<{ status?: string }>;

async function ApplicationsView({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const active = CARDS.find((c) => c.key === sp.status)?.key;

  const grouped = await prisma.partnerApplication.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const counts: Record<string, number> = {};
  for (const g of grouped) counts[g.status] = g._count._all;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {CARDS.map((c) => {
          const Icon = c.icon;
          const isActive = active === c.key;
          return (
            <Link
              key={c.key}
              href={isActive ? "/admin/applications" : `/admin/applications?status=${c.key}`}
              className={`block rounded-2xl border bg-gradient-to-br p-4 transition hover:-translate-y-0.5 hover:shadow-md ${c.card} ${
                isActive ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${c.iconBox}`}>
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <p className={`text-[11px] font-semibold uppercase tracking-wider ${c.labelCls}`}>{c.label}</p>
              </div>
              <p className={`${DISPLAY} mt-3 text-3xl font-bold lining-nums text-slate-900`}>
                {counts[c.key] ?? 0}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{c.sub}</p>
            </Link>
          );
        })}
      </div>

      {active && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>
            Showing: <b>{CARDS.find((c) => c.key === active)?.label}</b>
          </span>
          <Link href="/admin/applications" className="font-medium text-blue-600 hover:underline">
            Clear filter
          </Link>
        </div>
      )}

      <ApplicationsTable status={active} />
    </div>
  );
}

export default function ApplicationsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Super Admin</p>
        <h1 className={`${DISPLAY} mt-1 text-3xl font-bold text-slate-900`}>Applications</h1>
        <p className="mt-1 text-sm text-slate-500">Review partner applications and move them through approval.</p>
      </header>

      <Suspense fallback={<p className="text-sm text-slate-400">Loading applications...</p>}>
        <ApplicationsView searchParams={searchParams} />
      </Suspense>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
        <Info className="mt-0.5 h-[18px] w-[18px] shrink-0 text-amber-600" />
        <p>A partner becomes active only when approved and the registration &amp; training fee is paid.</p>
      </div>
    </div>
  );
}