export {
  Avatar,
  Card,
  Chip,
  Empty,
  ORDER_PILL,
  Pager,
  Pill,
  StatCard,
  TH,
  THEAD,
  fmtDate,
  inr,
  qs,
} from "@/components/finance/ui";

export const inr0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const FIELD =
  "w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none focus:border-blue-400";
export const LABEL = "mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500";
export const PRIMARY_BTN =
  "inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50";

export function SAHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Student Admin</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      {action}
    </header>
  );
}