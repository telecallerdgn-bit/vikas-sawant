import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ChevronRight,
  ClipboardList,
  Coins,
  FileText,
  Package,
  ShoppingBag,
  UserCheck,
  UserX,
  Users,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { DISPLAY } from "@/lib/ui";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});
const short = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", timeZone: "Asia/Kolkata" });

const TONES = {
  blue: {
    card: "border-sky-100 from-sky-50 to-blue-100/70",
    icon: "bg-blue-500 text-white",
    label: "text-blue-700",
    wave: "text-blue-400",
  },
  orange: {
    card: "border-orange-100 from-orange-50 to-amber-100/70",
    icon: "bg-orange-500 text-white",
    label: "text-orange-700",
    wave: "text-orange-400",
  },
  green: {
    card: "border-emerald-100 from-emerald-50 to-green-100/70",
    icon: "bg-emerald-500 text-white",
    label: "text-emerald-700",
    wave: "text-emerald-400",
  },
  purple: {
    card: "border-violet-100 from-violet-50 to-purple-100/70",
    icon: "bg-violet-500 text-white",
    label: "text-violet-700",
    wave: "text-violet-400",
  },
} as const;

const AVATARS = [
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
];

const ORDER_PILL: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-blue-100 text-blue-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-slate-100 text-slate-600",
};

const PAYOUT_PILL: Record<string, string> = {
  REQUESTED: "bg-amber-100 text-amber-800",
  APPROVED: "bg-blue-100 text-blue-700",
  PAID: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function avatarClass(name: string) {
  let sum = 0;
  for (const ch of name) sum += ch.charCodeAt(0);
  return AVATARS[sum % AVATARS.length];
}

function Avatar({ name }: { name: string }) {
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarClass(name)}`}
    >
      {initials(name)}
    </span>
  );
}

function StatCard({
  href,
  label,
  value,
  sub,
  icon: Icon,
  tone,
  trend,
}: {
  href: string;
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  tone: keyof typeof TONES;
  trend?: number | "new" | null;
}) {
  const t = TONES[tone];
  return (
    <Link
      href={href}
      className={`block rounded-2xl border bg-gradient-to-br p-5 transition hover:-translate-y-0.5 hover:shadow-md ${t.card}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.icon}`}>
            <Icon className="h-5 w-5" />
          </span>
          <p className={`text-xs font-semibold uppercase tracking-wider ${t.label}`}>{label}</p>
        </div>
        {trend === "new" && (
          <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-emerald-700">New</span>
        )}
        {typeof trend === "number" && (
          <span
            className={`flex items-center gap-0.5 rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium ${
              trend >= 0 ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {trend >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(Math.round(trend))}%
          </span>
        )}
      </div>
      <p className={`${DISPLAY} mt-4 text-3xl font-bold tracking-tight lining-nums text-slate-900`}>{value}</p>
      <p className="mt-1 text-sm text-slate-500">{sub}</p>
    </Link>
  );
}

function MiniStat({
  href,
  label,
  value,
  sub,
  icon: Icon,
  box,
  iconBox,
}: {
  href: string;
  label: string;
  value: number;
  sub: string;
  icon: LucideIcon;
  box: string;
  iconBox: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md ${box}`}
    >
      <div className="flex items-center gap-4">
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBox}`}>
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className={`${DISPLAY} text-2xl font-bold lining-nums text-slate-900`}>{value}</p>
          <p className="text-sm text-slate-500">{sub}</p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-slate-400" />
    </Link>
  );
}

export default async function AdminDashboard() {
  const session = await getSession(); // dynamic access first, then dates are safe

  const DAY = 86_400_000;
  const now = Date.now();
  const d30 = new Date(now - 30 * DAY);
  const d60 = new Date(now - 60 * DAY);

  const [paid, paidRecent, paidPrev, pending, newApps, toPack, totalUsers, activePartners, inactive, orders, payouts] =
    await Promise.all([
      prisma.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: { _all: true } }),
      prisma.order.aggregate({ where: { status: "PAID", createdAt: { gte: d30 } }, _sum: { amount: true } }),
      prisma.order.aggregate({
        where: { status: "PAID", createdAt: { gte: d60, lt: d30 } },
        _sum: { amount: true },
      }),
      prisma.payout.aggregate({
        where: { status: { in: ["REQUESTED", "APPROVED"] } },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.partnerApplication.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
      prisma.shipment.count({ where: { status: "AWAITING_PACKING" } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: "PARTNER", isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
        include: { student: { select: { name: true } }, course: { select: { name: true } } },
      }),
      prisma.payout.findMany({
        orderBy: { requestedAt: "desc" },
        take: 4,
        include: { user: { select: { name: true } } },
      }),
    ]);

  const recent = Number(paidRecent._sum.amount ?? 0);
  const prev = Number(paidPrev._sum.amount ?? 0);
  const trend: number | "new" | null = prev > 0 ? ((recent - prev) / prev) * 100 : recent > 0 ? "new" : null;

  const name = session?.name ?? "Admin";

  return (
    <div className="space-y-6">
     
          
      <div className="rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-100 px-8 py-7">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Welcome back,</p>
        <h1 className={`${DISPLAY} mt-1 text-4xl font-bold text-slate-900`}>{name}</h1>
        <p className="mt-2 text-sm text-slate-500">Here&rsquo;s what&rsquo;s happening with your platform today.</p>
      </div>

     
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          href="/admin/orders"
          label="Paid sales"
          value={inr.format(Number(paid._sum.amount ?? 0))}
          sub={`${paid._count._all} paid orders`}
          icon={Coins}
          tone="blue"
          trend={trend}
        />
        <StatCard
          href="/admin/payouts"
          label="Pending payouts"
          value={inr.format(Number(pending._sum.amount ?? 0))}
          sub={`${pending._count._all} requests waiting`}
          icon={Wallet}
          tone="orange"
        />
        <StatCard
          href="/admin/applications"
          label="New applications"
          value={String(newApps)}
          sub="Submitted or under review"
          icon={FileText}
          tone="green"
        />
        <StatCard
          href="/admin/shipments"
          label="Shipments to pack"
          value={String(toPack)}
          sub="Awaiting packing"
          icon={Package}
          tone="purple"
        />
      </div>

      
      <div className="grid gap-4 md:grid-cols-3">
        <MiniStat
          href="/admin/roles"
          label="Total users"
          value={totalUsers}
          sub="All roles"
          icon={Users}
          box="border-sky-100 bg-gradient-to-br from-sky-50 to-white"
          iconBox="bg-sky-100 text-sky-600"
        />
        <MiniStat
          href="/admin/partners"
          label="Active partners"
          value={activePartners}
          sub="Currently active"
          icon={UserCheck}
          box="border-violet-100 bg-gradient-to-br from-violet-50 to-white"
          iconBox="bg-violet-100 text-violet-600"
        />
        <MiniStat
          href="/admin/roles"
          label="Inactive accounts"
          value={inactive}
          sub="Disabled users"
          icon={UserX}
          box="border-rose-100 bg-gradient-to-br from-rose-50 to-white"
          iconBox="bg-rose-100 text-rose-600"
        />
      </div>

    
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className={`${DISPLAY} flex items-center gap-2 text-lg font-semibold`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <ShoppingBag className="h-5 w-5" />
              </span>
              Recent Orders
            </h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {orders.map((o) => (
                <li key={o.id} className="flex items-center gap-3 py-3">
                  <Avatar name={o.student.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{o.student.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      #{o.id} · {o.course.name} · {short.format(o.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-medium lining-nums">{inr.format(Number(o.amount))}</p>
                    <span
                      className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${ORDER_PILL[o.status]}`}
                    >
                      {o.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-violet-100 bg-gradient-to-b from-violet-50 to-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className={`${DISPLAY} flex items-center gap-2 text-lg font-semibold`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <ClipboardList className="h-5 w-5" />
              </span>
              Recent Payout Requests
            </h2>
            <Link href="/admin/payouts" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {payouts.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-500">
                <ClipboardList className="h-8 w-8" />
              </span>
              <p className="mt-3 font-medium text-slate-700">No payout requests yet.</p>
              <p className="mt-1 max-w-[16rem] text-sm text-slate-500">
                When you receive payout requests, they will appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-violet-100">
              {payouts.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <Avatar name={p.user.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.user.name}</p>
                    <p className="text-xs text-slate-500">
                      #{p.id} · {short.format(p.requestedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-medium lining-nums">{inr.format(Number(p.amount))}</p>
                    <span
                      className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${PAYOUT_PILL[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}