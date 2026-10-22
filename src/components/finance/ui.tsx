import Link from "next/link";

export {
  Avatar,
  Card,
  Empty,
  ORDER_PILL,
  PAYOUT_PILL,
  Pill,
  StatCard,
  TH,
  THEAD,
  fmtDate,
  inr,
  initials,
} from "@/components/subsuper/ui";

export const fmtDateTime = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

export function FinanceHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Finance</p>
      <h1 className="mt-1 text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </header>
  );
}

export function qs(base: string, params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "") continue;
    if (k === "page" && Number(v) <= 1) continue;
    q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}

export function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 text-sm ${
        active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </Link>
  );
}

export function Pager({
  base,
  params,
  page,
  pages,
}: {
  base: string;
  params: Record<string, string | number | undefined>;
  page: number;
  pages: number;
}) {
  if (pages <= 1) return null;
  const btn = "rounded border border-slate-200 bg-white px-3 py-1 hover:bg-slate-50";
  return (
    <div className="flex items-center justify-between text-sm text-slate-600">
      <span>
        Page {page} of {pages}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={qs(base, { ...params, page: page - 1 })} className={btn}>
            Previous
          </Link>
        )}
        {page < pages && (
          <Link href={qs(base, { ...params, page: page + 1 })} className={btn}>
            Next
          </Link>
        )}
      </div>
    </div>
  );
}