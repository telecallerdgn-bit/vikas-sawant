import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

export const fmtDate = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

export const MODE_LABEL: Record<string, string> = {
  LIVE_STUDY: "Live + Study Material",
  HYBRID: "Hybrid",
  STUDY_ONLY: "Study Material Only",
  ONLINE_PRERECORDED: "Online Prerecorded",
  LIVE_ONLY: "Live Only",
};

export const ORDER_PILL: Record<string, { label: string; cls: string }> = {
  PAID: { label: "Paid", cls: "bg-emerald-100 text-emerald-700" },
  PENDING: { label: "Pending", cls: "bg-blue-100 text-blue-700" },
  FAILED: { label: "Failed", cls: "bg-red-100 text-red-700" },
  REFUNDED: { label: "Refunded", cls: "bg-slate-100 text-slate-600" },
};

export const APP_PILL: Record<string, { label: string; cls: string }> = {
  SUBMITTED: { label: "Submitted", cls: "bg-blue-100 text-blue-700" },
  UNDER_REVIEW: { label: "Under review", cls: "bg-amber-100 text-amber-800" },
  MORE_INFO: { label: "More info", cls: "bg-violet-100 text-violet-700" },
  APPROVED: { label: "Approved", cls: "bg-cyan-100 text-cyan-700" },
  ACTIVE: { label: "Active", cls: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Rejected", cls: "bg-red-100 text-red-700" },
};

export const PAYOUT_PILL: Record<string, { label: string; cls: string }> = {
  REQUESTED: { label: "Requested", cls: "bg-amber-100 text-amber-800" },
  APPROVED: { label: "Approved", cls: "bg-blue-100 text-blue-700" },
  PAID: { label: "Paid", cls: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Rejected", cls: "bg-red-100 text-red-700" },
};

export const TONES = {
  blue: { card: "border-sky-100 from-sky-50 to-blue-100/70", icon: "bg-blue-500 text-white", label: "text-blue-700" },
  orange: { card: "border-orange-100 from-orange-50 to-amber-100/70", icon: "bg-orange-500 text-white", label: "text-orange-700" },
  green: { card: "border-emerald-100 from-emerald-50 to-green-100/70", icon: "bg-emerald-500 text-white", label: "text-emerald-700" },
  purple: { card: "border-violet-100 from-violet-50 to-purple-100/70", icon: "bg-violet-500 text-white", label: "text-violet-700" },
  cyan: { card: "border-cyan-100 from-cyan-50 to-sky-100/70", icon: "bg-cyan-500 text-white", label: "text-cyan-700" },
  rose: { card: "border-rose-100 from-rose-50 to-red-100/70", icon: "bg-rose-500 text-white", label: "text-rose-700" },
} as const;

export type Tone = keyof typeof TONES;

const AVATARS = [
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
];

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ name }: { name: string }) {
  let sum = 0;
  for (const ch of name) sum += ch.charCodeAt(0);
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${AVATARS[sum % AVATARS.length]}`}
    >
      {initials(name)}
    </span>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Sub Super Admin</p>
      <h1 className="mt-1 text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </header>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  tone: Tone;
}) {
  const t = TONES[tone];
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 ${t.card}`}>
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.icon}`}>
          <Icon className="h-5 w-5" />
        </span>
        <p className={`text-xs font-semibold uppercase tracking-wider ${t.label}`}>{label}</p>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight lining-nums text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{sub}</p>
    </div>
  );
}

export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col items-center border-t border-slate-100 py-14 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-500">
        <Inbox className="h-8 w-8" />
      </span>
      <p className="mt-3 font-medium text-slate-700">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-slate-500">{text}</p>
    </div>
  );
}

export function Pill({ cls, children }: { cls: string; children: React.ReactNode }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{children}</span>;
}

export function Card({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {badge && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{badge}</span>}
      </div>
      {children}
    </section>
  );
}

export const TH = "px-4 py-3 font-semibold";
export const THEAD = "bg-slate-50 text-xs uppercase tracking-wider text-slate-500";