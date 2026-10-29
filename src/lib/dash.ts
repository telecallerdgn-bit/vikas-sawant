export const DAY = 86_400_000;
const IST = 19_800_000; // UTC+5:30

export const startOfDayIST = (t: number) => {
  const s = t + IST;
  return s - (s % DAY) - IST;
};

/** Start of a month in IST. offset -1 is last month. */
export function startOfMonthIST(t: number, offset = 0) {
  const d = new Date(t + IST);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + offset, 1) - IST;
}

/** "2026-10-24" for the IST calendar day of a timestamp. */
export const dayKey = (t: number) => new Date(t + IST).toISOString().slice(0, 10);

const labelFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
export const dayLabel = (key: string) => labelFmt.format(new Date(`${key}T00:00:00Z`));

export type Trend = number | "new" | null;

export function trendOf(current: number, previous: number): Trend {
  if (previous > 0) return ((current - previous) / previous) * 100;
  return current > 0 ? "new" : null;
}

/** 12500 becomes 12.5K, 250000 becomes 2.5L. */
export function compact(v: number) {
  if (v >= 100_000) return `${+(v / 100_000).toFixed(1)}L`;
  if (v >= 1_000) return `${+(v / 1_000).toFixed(1)}K`;
  return String(v);
}

/** A tidy top value and step for a 4-step axis. */
export function niceAxis(max: number) {
  if (max <= 0) return { top: 4000, step: 1000 };
  const rough = max / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const step = [1, 2, 2.5, 5, 10].map((n) => n * mag).find((s) => s >= rough) ?? 10 * mag;
  return { top: step * 4, step };
}