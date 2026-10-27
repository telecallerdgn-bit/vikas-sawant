import type { CourseMode } from "@prisma/client";
import { MODES, effectivePrices } from "@/lib/catalog";

/** Modes that include physical books, so a delivery address is needed. */
export const BOOK_MODES: CourseMode[] = ["LIVE_STUDY", "STUDY_ONLY", "HYBRID"];

export type ModeOption = {
  mode: CourseMode;
  label: string;
  hint: string;
  /** What the student pays */
  price: number;
  /** Normal price, set only while an offer applies */
  original: number | null;
  needsAddress: boolean;
};

type CourseForPricing = {
  mode: CourseMode;
  price: unknown;
  prices: { mode: CourseMode; price: unknown }[];
  offerPrice: unknown;
  offerEndsAt: Date | null;
};

/** Modes a course is sold in, with the price to charge. The offer applies to the cheapest mode, as on the course page. */
export function modeOptions(c: CourseForPricing, now: number): ModeOption[] {
  const rows = effectivePrices(c); // cheapest first
  const offer = c.offerPrice != null ? Number(c.offerPrice) : null;
  const live = offer !== null && (c.offerEndsAt === null || c.offerEndsAt.getTime() > now);
  const offerValue = live ? offer : null;

  return rows.map((r, i) => {
    const m = MODES.find((x) => x.value === r.mode);
    const price = i === 0 && offerValue !== null && offerValue < r.price ? offerValue : r.price;
    return {
      mode: r.mode,
      label: m?.label ?? r.mode,
      hint: m?.hint ?? "",
      price,
      original: price !== r.price ? r.price : null,
      needsAddress: BOOK_MODES.includes(r.mode),
    };
  });
}