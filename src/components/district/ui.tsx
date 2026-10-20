import type { ReactNode } from "react";
import Icon, { type IconName } from "@/components/icons";

export const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});
export const dateFmt = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" });
export const timeFmt = new Intl.DateTimeFormat("en-IN", { timeStyle: "short", timeZone: "Asia/Kolkata" });

export const THEAD = "bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500";

export function initials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
}

// Tailwind ko poori class chahiye, isliye rang yahan literal likhe hain
const TONES = {
  blue: { card: "border-blue-100 bg-blue-50/60", icon: "bg-blue-500", label: "text-blue-700" },
  green: { card: "border-emerald-100 bg-emerald-50/60", icon: "bg-emerald-500", label: "text-emerald-700" },
  amber: { card: "border-amber-100 bg-amber-50/60", icon: "bg-orange-500", label: "text-orange-700" },
  violet: { card: "border-violet-100 bg-violet-50/60", icon: "bg-violet-500", label: "text-violet-700" },
} as const;

export type Tone = keyof typeof TONES;

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">District Admin</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </header>
  );
}

export function StatCard({
  label,
  value,
  note,
  tone,
  icon,
}: {
  label: string;
  value: string;
  note: string;
  tone: Tone;
  icon: IconName;
}) {
  const t = TONES[tone];
  return (
    <div className={`rounded-2xl border p-5 ${t.card}`}>
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${t.icon}`}>
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <span className={`text-sm font-semibold uppercase tracking-wide ${t.label}`}>{label}</span>
      </div>
      <p className="mt-4 text-3xl font-bold tabular-nums text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{note}</p>
    </div>
  );
}

export function Cards({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

export function Card({ title, total, children }: { title: string; total?: number | string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {total !== undefined && (
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {total} total
          </span>
        )}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function Avatar({ name }: { name: string }) {
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white"
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

export function Badge({ cls, children }: { cls: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

// Data na ho tab bhi table ka layout dikhe: halki "ghost" rows + neeche saaf message
export function EmptyRow({ cols, title, text }: { cols: number; title: string; text: string }) {
  const widths = ["w-16", "w-32", "w-24", "w-28", "w-20", "w-14"];
  return (
    <>
      {[0, 1, 2].map((r) => (
        <tr key={`ghost-${r}`} aria-hidden="true" className="select-none">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-6 py-4">
              <div className="flex items-center gap-3">
                {c === 1 && <span className="h-9 w-9 shrink-0 rounded-full bg-slate-100" />}
                <span
                  className={`h-3 rounded-full bg-slate-100 ${c === cols - 1 ? "ml-auto" : ""} ${
                    widths[(c + r * 2) % widths.length]
                  }`}
                />
              </div>
            </td>
          ))}
        </tr>
      ))}
      <tr>
        <td colSpan={cols} className="border-t border-slate-100 px-6 py-10 text-center">
          <p className="font-medium text-slate-700">{title}</p>
          <p className="mt-1 text-sm text-slate-500">{text}</p>
        </td>
      </tr>
    </>
  );
}

export function NoDistrict() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
      <p className="font-semibold text-amber-900">No district is assigned to your account yet</p>
      <p className="mt-1 text-sm text-amber-800">
        Ask a super admin to set you as the district admin on the Districts page.
      </p>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[132px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}