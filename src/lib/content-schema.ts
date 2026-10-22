import { z } from "zod";
import { MODE_VALUES, SLUG_RE } from "@/lib/catalog";

const imageUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => {
    // Uploaded images are stored on this site, so a path like /media/abc.jpg is valid
    if (v.startsWith("/") && !v.startsWith("//")) return true;
    try {
      const u = new URL(v);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch {
      return false;
    }
  }, "Enter a valid image link");

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Link name is too short")
  .max(80)
  .regex(SLUG_RE, "Link name can only have letters, numbers and hyphens");

const money = z
  .number({ message: "Enter a price for every selected mode" })
  .min(1, "Price must be at least ₹1")
  .max(1_000_000, "Price is too high")
  .refine((v) => Math.round(v * 100) / 100 === v, "Use at most 2 decimals in a price");

export const courseSchema = z.object({
  name: z.string().trim().min(3, "Course name is too short").max(120),
  slug,
  summary: z.string().trim().max(300, "Summary can be 300 characters at most").default(""),
  description: z.string().trim().max(20000).default(""),
  coverImage: imageUrl.or(z.literal("")).default(""),
  isActive: z.boolean(),
  prices: z
    .array(z.object({ mode: z.enum(MODE_VALUES), price: money }))
    .min(1, "Add at least one mode with a price")
    .max(MODE_VALUES.length)
    .refine((arr) => new Set(arr.map((p) => p.mode)).size === arr.length, "Each mode can be used only once"),

  categoryId: z.number().int().positive().nullable().default(null),
  overview: z.string().max(20000).default(""),
  eligibility: z.string().max(20000).default(""),
  keyBenefits: z.string().max(20000).default(""),
    offerPrice: money.nullable().default(null),
  offerLabel: z.string().trim().max(80, "Offer label can be 80 characters at most").default(""),
  offerEndsAt: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a valid offer end date")
    .default(""),
});

export const blogSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(150),
  slug,
  excerpt: z.string().trim().max(300, "Excerpt can be 300 characters at most").default(""),
  content: z.string().max(100000).default(""),
  coverImage: imageUrl.or(z.literal("")).default(""),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});