export const THEAD = "bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500";
export const TH = "px-6 py-3.5";

export default function TableCard({
  title,
  count,
  footer,
  children,
}: {
  title: string;
  count?: number;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {count !== undefined && (
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {count} total
          </span>
        )}
      </div>
      <div className="overflow-x-auto">{children}</div>
      {footer}
    </section>
  );
}

export function EmptyRow({ colSpan, title, hint }: { colSpan: number; title: string; hint?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-14 text-center">
        <p className="font-medium text-slate-700">{title}</p>
        {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
      </td>
    </tr>
  );
}