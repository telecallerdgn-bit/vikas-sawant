import { MODES } from "@/lib/catalog";

export const SORTS = [
  { value: "new", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
] as const;

export type SortValue = (typeof SORTS)[number]["value"];

export type CourseParams = {
  q: string;
  category: string;
  mode: string;
  sort: SortValue;
};

type Raw = { q?: string; category?: string; mode?: string; sort?: string };

/** Reads the address bar. Anything unexpected is ignored, so a bad link never breaks the page. */
export function parseParams(raw: Raw): CourseParams {
  const q = (raw.q ?? "").trim().slice(0, 60);
  const category = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(raw.category ?? "") ? (raw.category as string).slice(0, 80) : "";
  const mode = MODES.some((m) => m.value === raw.mode) ? (raw.mode as string) : "";
  const sort = SORTS.find((s) => s.value === raw.sort)?.value ?? "new";
  return { q, category, mode, sort };
}

/** Builds a /courses link with some filters changed and the rest kept. */
export function hrefWith(current: CourseParams, patch: Partial<CourseParams>) {
  const next = { ...current, ...patch };
  const qs = new URLSearchParams();
  if (next.q) qs.set("q", next.q);
  if (next.category) qs.set("category", next.category);
  if (next.mode) qs.set("mode", next.mode);
  if (next.sort !== "new") qs.set("sort", next.sort);
  const s = qs.toString();
  return s ? `/courses?${s}` : "/courses";
}

export function activeFilterCount(p: CourseParams) {
  return [p.q, p.category, p.mode, p.sort !== "new" ? p.sort : ""].filter(Boolean).length;
}