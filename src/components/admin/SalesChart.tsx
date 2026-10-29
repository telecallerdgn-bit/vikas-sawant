import { compact } from "@/lib/dash";

export type ChartDay = { key: string; label: string; total: number };

const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function SalesChart({ days, top, step }: { days: ChartDay[]; top: number; step: number }) {
  const hasSales = days.some((d) => d.total > 0);
  const ticks = [0, 1, 2, 3, 4];
  const sparse = days.length > 10; // on a 30 day chart only every 5th date is written

  return (
    <div>
      <div className="relative mt-4 h-56 pl-12">
        {ticks.map((i) => (
          <div key={i} className="absolute inset-x-0" style={{ bottom: `${(i / 4) * 100}%` }}>
            <span className="absolute left-0 -translate-y-1/2 text-xs tabular-nums text-slate-400">
              {compact(i * step)}
            </span>
            <div className="ml-12 border-t border-dashed border-slate-200" />
          </div>
        ))}

        <div className="relative flex h-full items-end gap-1.5">
          {days.map((d) => {
            const pct = d.total > 0 ? Math.max(2, (d.total / top) * 100) : 0;
            return (
              <div key={d.key} className="group flex h-full flex-1 items-end" title={`${d.label}: ${rupees.format(d.total)}`}>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-indigo-400 transition group-hover:from-blue-600 group-hover:to-indigo-500"
                  style={{ height: `${pct}%` }}
                />
              </div>
            );
          })}
        </div>

        {!hasSales && (
          <p className="absolute inset-0 flex items-center justify-center pl-12 text-sm text-slate-400">
            No sales in this period
          </p>
        )}
      </div>

      <div className="mt-2 flex gap-1.5 pl-12">
        {days.map((d, i) => (
          <span key={d.key} className="flex-1 text-center text-[11px] text-slate-400">
            {!sparse || i % 5 === 0 ? d.label : ""}
          </span>
        ))}
      </div>
    </div>
  );
}