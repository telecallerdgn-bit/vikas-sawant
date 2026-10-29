import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

export const dateShort = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

export const dateTime = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

/** Shipment statuses that mean the parcel is on its way. */
export const TRANSIT = ["LABEL_GENERATED", "DISPATCHED", "IN_TRANSIT", "OUT_FOR_DELIVERY"];

export const ORDER_PILL: Record<string, { label: string; cls: string }> = {
  PAID: { label: "Paid", cls: "bg-emerald-100 text-emerald-700" },
  PENDING: { label: "Payment pending", cls: "bg-amber-100 text-amber-800" },
  FAILED: { label: "Failed", cls: "bg-red-100 text-red-700" },
  REFUNDED: { label: "Refunded", cls: "bg-slate-100 text-slate-600" },
};

export const CHANNEL_LABEL: Record<string, string> = { SMS: "SMS", WHATSAPP: "WhatsApp", EMAIL: "Email" };

const TONES = {
  gold: { card: "border-amber-100 from-amber-50 to-yellow-100/70", icon: "bg-[#f8b915] text-[#0b2149]", label: "text-amber-800" },
  navy: { card: "border-slate-200 from-slate-50 to-blue-100/60", icon: "bg-[#0b2149] text-white", label: "text-[#0b2149]" },
  green: { card: "border-emerald-100 from-emerald-50 to-green-100/70", icon: "bg-emerald-500 text-white", label: "text-emerald-700" },
  sky: { card: "border-sky-100 from-sky-50 to-blue-100/70", icon: "bg-blue-500 text-white", label: "text-blue-700" },
} as const;

export type Tone = keyof typeof TONES;

export function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Student</p>
      <h1 className="mt-1 text-3xl font-bold text-[#0b2149]">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </header>
  );
}

export function Tile({
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
        <p className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>{label}</p>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight lining-nums text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{sub}</p>
    </div>
  );
}

export function Panel({
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
        <h2 className="text-lg font-bold text-[#0b2149]">{title}</h2>
        {action && (
          <Link href={action.href} className="text-sm font-semibold text-[#a66e00] hover:underline">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function Empty({
  title,
  text,
  cta,
}: {
  title: string;
  text: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center border-t border-slate-100 px-4 py-12 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
        <Inbox className="h-8 w-8" />
      </span>
      <p className="mt-3 font-semibold text-slate-800">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>
      {cta && (
        <Link
          href={cta.href}
          className="mt-4 rounded-full bg-[#f8b915] px-6 py-2.5 text-sm font-bold text-[#0b2149] hover:bg-[#e3a600]"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}

export function Pill({ cls, children }: { cls: string; children: React.ReactNode }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{children}</span>;
}