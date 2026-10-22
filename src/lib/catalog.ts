import type { CourseMode } from "@prisma/client";

export const MODES: { value: CourseMode; label: string; hint: string }[] = [
  { value: "ONLINE_PRERECORDED", label: "Online Prerecorded", hint: "Recorded lessons" },
  { value: "LIVE_STUDY", label: "Live + Study Material", hint: "Live classes and books" },
  { value: "STUDY_ONLY", label: "Study Material Only", hint: "Books only" },
  { value: "HYBRID", label: "Hybrid", hint: "Live, recorded and books" },
  { value: "LIVE_ONLY", label: "Live Only", hint: "Live classes only" },
];

export const MODE_VALUES = MODES.map((m) => m.value) as [CourseMode, ...CourseMode[]];
export const MODE_LABEL: Record<string, string> = Object.fromEntries(MODES.map((m) => [m.value, m.label]));

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

type PriceLike = { mode: CourseMode; price: unknown };

/** Prices of a course. Old courses without CoursePrice rows fall back to their single mode and price. */
export function effectivePrices(c: { mode: CourseMode; price: unknown; prices: PriceLike[] }) {
  const rows = c.prices.length > 0 ? c.prices : [{ mode: c.mode, price: c.price }];
  return rows.map((r) => ({ mode: r.mode, price: Number(r.price) })).sort((a, b) => a.price - b.price);
}