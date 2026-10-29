import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  FileText,
  Inbox,
  Package,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { PAYEE_TYPES } from "@/lib/finance";
import { SHIP_LABEL } from "@/lib/shipment";
import { DISPLAY } from "@/lib/ui";
import { DAY, dayKey, dayLabel, niceAxis, startOfDayIST, startOfMonthIST, trendOf, type Trend } from "@/lib/dash";
import SalesChart from "@/components/admin/SalesChart";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 });
const inr0 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const shortDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

/* Row 1: all light blue, in four different shades */
const BLUE = {
  sky: { card: "border-sky-100 from-sky-50 to-blue-100/70", icon: "bg-blue-500", label: "text-blue-700" },
  blue: { card: "border-blue-100 from-blue-50 to-indigo-100/70", icon: "bg-sky-500", label: "text-sky-700" },
  cyan: { card: "border-cyan-100 from-cyan-50 to-sky-100/70", icon: "bg-cyan-500", label: "text-cyan-700" },
  indigo: { card: "border-indigo-100 from-indigo-50 to-blue-100/70", icon: "bg-indigo-500", label: "text-indigo-700" },
} as const;

/* Row 2 and Row 3: change a tone here to recolour a card */
const SOFT = {
  blue: { card: "border-sky-100 bg-gradient-to-br from-sky-50 to-white", chip: "bg-sky-100 text-sky-600" },
  violet: { card: "border-violet-100 bg-gradient-to-br from-violet-50 to-white", chip: "bg-violet-100 text-violet-600" },
  green: { card: "border-emerald-100 bg-gradient-to-br from-emerald-50 to-white", chip: "bg-emerald-100 text-emerald-600" },
  rose: { card: "border-rose-100 bg-gradient-to-br from-rose-50 to-white", chip: "bg-rose-100 text-rose-600" },
  amber: { card: "border-amber-100 bg-gradient-to-br from-amber-50 to-white", chip: "bg-amber-100 text-amber-600" },
} as const;

const ORDER_PILL: Record<string, { label: string; cls: string }> = {
  PAID: { label: "Paid", cls: "bg-emerald-100 text-emerald-700" },
  PENDING: { label: "Pending", cls: "bg-amber-100 text-amber-800" },
  FAILED: { label: "Failed", cls: "bg-red-100 text-red-700" },
  REFUNDED: { label: "Refunded", cls: "bg-slate-100 text-slate-600" },
};

const APP_PILL: Record<string, { label: string; cls: string }> = {
  SUBMITTED: { label: "New", cls: "bg-blue-100 text-blue-700" },
  UNDER_REVIEW: { label: "Under review", cls: "bg-amber-100 text-amber-800" },
  MORE_INFO: { label: "More info", cls: "bg-violet-100 text-violet-700" },
  APPROVED: { label: "Approved", cls: "bg-emerald-100 text-emerald-700" },
  ACTIVE: { label: "Active", cls: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Rejected", cls: "bg-red-100 text-red-700" },
};

const n = (v: unknown) => Number(v ?? 0);

function TrendBadge({ trend }: { trend: Trend }) {
  if (trend === null) return null;
  if (trend === "new") {
    return <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold text-emerald-700">New</span>;
  }
  const up = trend >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold ${
        up ? "text-emerald-700" : "text-red-600"
      }`}
    >
      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(Math.round(trend))}%
    </span>
  );
}

function TopCard(p: {
  href: string;
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  tone: keyof typeof BLUE;
  trend?: Trend;
}) {
  const t = BLUE[p.tone];
  const Icon = p.icon;
  return (
    <Link
      href={p.href}
      className={`block rounded-2xl border bg-gradient-to-br p-5 transition hover:-translate-y-0.5 hover:shadow-md ${t.card}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${t.icon}`}>
            <Icon className="h-5 w-5" />
          </span>
          <p className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>{p.label}</p>
        </div>
        {p.trend !== undefined && <TrendBadge trend={p.trend} />}
      </div>
      <p className={`${DISPLAY} mt-4 text-3xl font-bold tracking-tight lining-nums text-slate-900`}>{p.value}</p>
      <p className="mt-1 text-sm text-slate-500">{p.sub}</p>
    </Link>
  );
}

function MiniCard(p: {
  href: string;
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  tone: keyof typeof SOFT;
  trend?: Trend;
}) {
  const t = SOFT[p.tone];
  const Icon = p.icon;
  return (
    <Link
      href={p.href}
      className={`flex items-center justify-between gap-3 rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md ${t.card}`}
    >
      <div className="flex items-center gap-4">
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${t.chip}`}>
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{p.label}</p>
          <p className={`${DISPLAY} text-2xl font-bold lining-nums text-slate-900`}>{p.value}</p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            {p.trend !== undefined && p.trend !== null && <TrendBadge trend={p.trend} />}
            <span>{p.sub}</span>
          </div>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
    </Link>
  );
}

function BottomCard(p: {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  tone: keyof typeof SOFT;
  trend?: Trend;
}) {
  const t = SOFT[p.tone];
  const Icon = p.icon;
  return (
    <div className={`flex items-center gap-4 rounded-2xl border p-5 ${t.card}`}>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${t.chip}`}>
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-600">{p.label}</p>
        <div className="flex flex-wrap items-center gap-2">
          <p className={`${DISPLAY} text-2xl font-bold lining-nums text-slate-900`}>{p.value}</p>
          {p.trend !== undefined && <TrendBadge trend={p.trend} />}
        </div>
        <p className="text-xs text-slate-500">{p.sub}</p>
      </div>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className={`${DISPLAY} text-lg font-bold text-slate-900`}>{title}</h2>
        {action && (
          <Link href={action.href} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
            {action.label} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function EmptyList({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center border-t border-slate-100 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-500">
        <Inbox className="h-6 w-6" />
      </span>
      <p className="mt-2 text-sm text-slate-500">{text}</p>
    </div>
  );
}

function Pill({ cls, children }: { cls: string; children: React.ReactNode }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{children}</span>;
}

export default async function AdminOverview({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  // Reading the session and params first makes this page dynamic, so Date.now() below is allowed
  const [session, sp] = await Promise.all([getSession(), searchParams]);
  const range = sp.range === "30" ? 30 : 7;

  const now = Date.now();
  const d30 = new Date(now - 30 * DAY);
  const d60 = new Date(now - 60 * DAY);
  const d7 = new Date(now - 7 * DAY);
  const d14 = new Date(now - 14 * DAY);

  const chartStart = startOfDayIST(now) - (range - 1) * DAY;

  // This month so far, against the same number of days last month
  const monthStart = startOfMonthIST(now);
  const prevMonthStart = startOfMonthIST(now, -1);
  const prevMonthEnd = Math.min(prevMonthStart + (now - monthStart), monthStart);
  const thisM = { gte: new Date(monthStart), lte: new Date(now) };
  const prevM = { gte: new Date(prevMonthStart), lt: new Date(prevMonthEnd) };

  const [
    paidAll, paid30, paidPrev30, pendingPayouts, newApps, toPack,
    ordersAll, orders7, ordersPrev7, feePending, approvedApps, activePartners,
    chartOrders, recentOrders, recentApps,
    comm, commPrev, sales, salesPrev, done, donePrev,
  ] = await Promise.all([
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: { _all: true } }),
    prisma.order.aggregate({ where: { status: "PAID", createdAt: { gte: d30 } }, _sum: { amount: true } }),
    prisma.order.aggregate({ where: { status: "PAID", createdAt: { gte: d60, lt: d30 } }, _sum: { amount: true } }),
    prisma.payout.aggregate({
      where: { status: { in: ["REQUESTED", "APPROVED"] } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.partnerApplication.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    prisma.shipment.count({ where: { status: "AWAITING_PACKING" } }),

    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: d7 } } }),
    prisma.order.count({ where: { createdAt: { gte: d14, lt: d7 } } }),
    prisma.partnerApplication.count({ where: { status: "APPROVED", feePaid: false } }),
    prisma.partnerApplication.count({ where: { status: { in: ["APPROVED", "ACTIVE"] } } }),
    prisma.user.count({ where: { role: "PARTNER", isActive: true } }),

    prisma.order.findMany({
      where: { status: "PAID", createdAt: { gte: new Date(chartStart) } },
      select: { createdAt: true, amount: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        amount: true,
        status: true,
        student: { select: { name: true } },
        shipment: { select: { status: true } },
      },
    }),
    prisma.partnerApplication.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, status: true, createdAt: true },
    }),

    prisma.ledgerEntry.aggregate({ where: { type: { in: PAYEE_TYPES }, createdAt: thisM }, _sum: { amount: true } }),
    prisma.ledgerEntry.aggregate({ where: { type: { in: PAYEE_TYPES }, createdAt: prevM }, _sum: { amount: true } }),
    prisma.order.aggregate({ where: { status: "PAID", createdAt: thisM }, _sum: { amount: true } }),
    prisma.order.aggregate({ where: { status: "PAID", createdAt: prevM }, _sum: { amount: true } }),
    prisma.payout.aggregate({ where: { status: "PAID", paidAt: thisM }, _sum: { amount: true } }),
    prisma.payout.aggregate({ where: { status: "PAID", paidAt: prevM }, _sum: { amount: true } }),
  ]);

  // Chart: one bar per day, summed in IST
  const perDay = new Map<string, number>();
  for (const o of chartOrders) {
    const k = dayKey(o.createdAt.getTime());
    perDay.set(k, (perDay.get(k) ?? 0) + n(o.amount));
  }
  const days = Array.from({ length: range }, (_, i) => {
    const key = dayKey(chartStart + i * DAY);
    return { key, label: dayLabel(key), total: perDay.get(key) ?? 0 };
  });
  const periodTotal = days.reduce((a, d) => a + d.total, 0);
  const axis = niceAxis(Math.max(...days.map((d) => d.total)));

  const salesTrend = trendOf(n(paid30._sum.amount), n(paidPrev30._sum.amount));
  const ordersTrend = trendOf(orders7, ordersPrev7);
  const vsLast = "vs same days last month";

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-100 px-8 py-7">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Welcome back,</p>
        <h1 className={`${DISPLAY} mt-1 text-4xl font-bold text-slate-900`}>{session?.name ?? "Admin"}</h1>
        <p className="mt-2 text-sm text-slate-500">Here&rsquo;s what&rsquo;s happening with your platform today.</p>
      </div>

      {/* Row 1: light blue */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TopCard
          href="/admin/orders"
          label="Total sales"
          value={inr.format(n(paidAll._sum.amount))}
          sub={`${paidAll._count._all} paid order${paidAll._count._all === 1 ? "" : "s"}`}
          icon={Coins}
          tone="sky"
          trend={salesTrend}
        />
        <TopCard
          href="/admin/payouts"
          label="Pending payouts"
          value={inr.format(n(pendingPayouts._sum.amount))}
          sub={`${pendingPayouts._count._all} request${pendingPayouts._count._all === 1 ? "" : "s"} waiting`}
          icon={Wallet}
          tone="blue"
        />
        <TopCard
          href="/admin/applications"
          label="New applications"
          value={String(newApps)}
          sub="Submitted or under review"
          icon={FileText}
          tone="cyan"
        />
        <TopCard
          href="/admin/shipments"
          label="Shipments to pack"
          value={String(toPack)}
          sub="Awaiting packing"
          icon={Package}
          tone="indigo"
        />
      </div>

      {/* Row 2 */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniCard
          href="/admin/orders"
          label="Total orders"
          value={String(ordersAll)}
          sub="from last week"
          icon={ShoppingBag}
          tone="blue"
          trend={ordersTrend}
        />
        <MiniCard
          href="/admin/applications?status=APPROVED"
          label="Fee pending"
          value={String(feePending)}
          sub="Approved, fee not paid"
          icon={Clock}
          tone="violet"
        />
        <MiniCard
          href="/admin/applications"
          label="Approved applications"
          value={String(approvedApps)}
          sub="Successfully approved"
          icon={CheckCircle2}
          tone="green"
        />
        <MiniCard
          href="/admin/partners"
          label="Total partners"
          value={String(activePartners)}
          sub="Active partners"
          icon={Users}
          tone="rose"
        />
      </div>

      {/* Chart and recent lists */}
      <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className={`${DISPLAY} text-lg font-bold text-slate-900`}>Sales overview</h2>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-900">{inr0.format(periodTotal)}</span> in the last {range} days
              </p>
            </div>
            <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1 text-sm">
              {[7, 30].map((r) => (
                <Link
                  key={r}
                  href={r === 7 ? "/admin" : `/admin?range=${r}`}
                  className={`rounded-full px-3 py-1 font-medium ${
                    range === r ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-white"
                  }`}
                >
                  {r} days
                </Link>
              ))}
            </div>
          </div>
          <SalesChart days={days} top={axis.top} step={axis.step} />
        </section>

        <Panel title="Recent orders" action={{ href: "/admin/orders", label: "View all" }}>
          {recentOrders.length === 0 ? (
            <EmptyList text="No orders yet." />
          ) : (
            <ul className="divide-y divide-slate-100 border-t border-slate-100">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link href="/admin/orders" className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                    <span className="w-12 shrink-0 font-mono text-xs text-slate-500">#{o.id}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">{o.student.name}</p>
                      {o.shipment && (
                        <p className="text-xs text-slate-400">Books: {SHIP_LABEL[o.shipment.status]}</p>
                      )}
                    </div>
                    <span className="font-mono text-sm lining-nums text-slate-800">{inr0.format(n(o.amount))}</span>
                    <Pill cls={ORDER_PILL[o.status].cls}>{ORDER_PILL[o.status].label}</Pill>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent applications" action={{ href: "/admin/applications", label: "View all" }}>
          {recentApps.length === 0 ? (
            <EmptyList text="No applications yet." />
          ) : (
            <ul className="divide-y divide-slate-100 border-t border-slate-100">
              {recentApps.map((a) => (
                <li key={a.id}>
                  <Link href="/admin/applications" className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                    <span className="w-16 shrink-0 font-mono text-xs text-slate-500">
                      APP-{String(a.id).padStart(3, "0")}
                    </span>
                    <p className="min-w-0 flex-1 truncate font-medium text-slate-900">{a.name}</p>
                    <Pill cls={APP_PILL[a.status].cls}>{APP_PILL[a.status].label}</Pill>
                    <span className="w-12 shrink-0 text-right text-xs text-slate-400">{shortDate.format(a.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Row 3: this month */}
      <div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <BottomCard
            label="Total commission earned"
            value={inr.format(n(comm._sum.amount))}
            sub="This month"
            icon={Coins}
            tone="blue"
            trend={trendOf(n(comm._sum.amount), n(commPrev._sum.amount))}
          />
          <BottomCard
            label="Paid sales"
            value={inr.format(n(sales._sum.amount))}
            sub="This month"
            icon={Wallet}
            tone="green"
            trend={trendOf(n(sales._sum.amount), n(salesPrev._sum.amount))}
          />
          <BottomCard
            label="Pending payouts"
            value={inr.format(n(pendingPayouts._sum.amount))}
            sub={`${pendingPayouts._count._all} request${pendingPayouts._count._all === 1 ? "" : "s"}`}
            icon={Clock}
            tone="amber"
          />
          <BottomCard
            label="Completed payouts"
            value={inr.format(n(done._sum.amount))}
            sub="This month"
            icon={CheckCircle2}
            tone="violet"
            trend={trendOf(n(done._sum.amount), n(donePrev._sum.amount))}
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">Arrows compare with the {vsLast}.</p>
      </div>
    </div>
  );
}