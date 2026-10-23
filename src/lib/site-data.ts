import type { CourseMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { effectivePrices } from "@/lib/catalog";

export type CourseCardData = {
  id: number;
  slug: string;
  name: string;
  summary: string | null;
  coverImage: string | null;
  from: number;
  /** Set only while an offer is live and cheaper than `from` */
  offerFrom: number | null;
  offerLabel: string | null;
  modes: CourseMode[];
};

export type CategoryData = {
  id: number;
  name: string;
  slug: string;
  count: number;
};

type CourseRow = {
  id: number;
  slug: string | null;
  name: string;
  summary: string | null;
  coverImage: string | null;
  mode: CourseMode;
  price: unknown;
  prices: { mode: CourseMode; price: unknown }[];
  offerPrice: unknown;
  offerLabel: string | null;
  offerEndsAt: Date | null;
};

function toCard(c: CourseRow): CourseCardData {
  const prices = effectivePrices(c);
  const from = Math.min(...prices.map((p) => p.price));

  // The offer counts only until its end date passes
  const offer = c.offerPrice != null ? Number(c.offerPrice) : null;
  const live = offer !== null && (c.offerEndsAt === null || c.offerEndsAt.getTime() > Date.now());
  const offerFrom = live && offer !== null && offer < from ? offer : null;

  return {
    id: c.id,
    slug: c.slug as string, // rows without a slug are filtered out below
    name: c.name,
    summary: c.summary,
    coverImage: c.coverImage,
    from,
    offerFrom,
    offerLabel: offerFrom !== null ? c.offerLabel : null,
    modes: prices.map((p) => p.mode),
  };
}

/**
 * Active courses that have a link name. Courses without one cannot have a page yet.
 * `category` is a category link name (slug); leave it out to get every category.
 */
export async function getActiveCourses(take: number, q?: string, category?: string) {
  const rows = await prisma.course.findMany({
    where: {
      isActive: true,
      slug: { not: null },
      ...(q ? { name: { contains: q } } : {}),
      ...(category ? { category: { slug: category } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
    include: { prices: true },
  });
  return rows.map(toCard);
}

/** Categories that have at least one active course, in the order set in the admin. */
export async function getCourseCategories(): Promise<CategoryData[]> {
  const rows = await prisma.courseCategory.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { courses: { where: { isActive: true, slug: { not: null } } } } },
    },
  });
  return rows
    .filter((r) => r._count.courses > 0)
    .map((r) => ({ id: r.id, name: r.name, slug: r.slug, count: r._count.courses }));
}

export async function getCourseBySlug(slug: string) {
  return prisma.course.findFirst({
    where: { slug, isActive: true },
    include: { prices: true },
  });
}

export async function getPublishedPosts(take: number, skip = 0) {
  const where = { status: "PUBLISHED" as const };
  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take,
      select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, publishedAt: true },
    }),
    prisma.blogPost.count({ where }),
  ]);
  return { posts, total };
}

export async function getPostBySlug(slug: string) {
  return prisma.blogPost.findFirst({ where: { slug, status: "PUBLISHED" } });
}