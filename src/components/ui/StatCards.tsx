import Icon, { type IconName } from "@/components/icons";

// Full class names are written out so Tailwind can detect them.
const TONES = {
  blue: { card: "border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50", tile: "bg-blue-500", label: "text-blue-700" },
  emerald: { card: "border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50", tile: "bg-emerald-500", label: "text-emerald-700" },
  orange: { card: "border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50", tile: "bg-orange-500", label: "text-orange-700" },
  violet: { card: "border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50", tile: "bg-violet-500", label: "text-violet-700" },
  rose: { card: "border-rose-100 bg-gradient-to-br from-rose-50 to-pink-50", tile: "bg-rose-500", label: "text-rose-700" },
  sky: { card: "border-sky-100 bg-gradient-to-br from-sky-50 to-cyan-50", tile: "bg-sky-500", label: "text-sky-700" },
} as const;

export type Tone = keyof typeof TONES;
export type Stat = { label: string; value: string; hint?: string; icon: IconName; tone: Tone };

const COLS = { 3: "xl:grid-cols-3", 4: "xl:grid-cols-4", 5: "xl:grid-cols-5" } as const;

export default function StatCards({ items, cols = 4 }: { items: Stat[]; cols?: 3 | 4 | 5 }) {
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${COLS[cols]}`}>
      {items.map((s) => {
        const t = TONES[s.tone];
        return (
          <div key={s.label} className={`rounded-2xl border p-4 ${t.card}`}>
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${t.tile}`}>
                <Icon name={s.icon} className="h-5 w-5" />
              </span>
              <p className={`text-xs font-bold uppercase tracking-wide ${t.label}`}>{s.label}</p>
            </div>
            <p className="mt-4 text-3xl font-bold tabular-nums text-slate-900">{s.value}</p>
            {s.hint && <p className="mt-0.5 text-sm text-slate-500">{s.hint}</p>}
          </div>
        );
      })}
    </div>
  );
}