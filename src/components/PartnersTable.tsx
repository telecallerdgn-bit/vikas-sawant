import { prisma } from "@/lib/prisma";
import PartnersView, { type PartnerRow } from "@/components/PartnersView";

export default async function PartnersTable() {
  const [partners, districts] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PARTNER" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        mobile: true,
        referralCode: true,
        isActive: true,
        districtId: true,
        district: { select: { name: true } },
        parent: { select: { name: true, referralCode: true } },
        _count: { select: { students: true, children: true } },
      },
    }),
    prisma.district.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  // Same rule as the partner's own portal: total earned is the sum of every credit
  // (positive amount) in the partner's wallet, so both pages always show the same number.
  const earned = await prisma.ledgerEntry.groupBy({
    by: ["userId"],
    where: { userId: { in: partners.map((p) => p.id) }, amount: { gt: 0 } },
    _sum: { amount: true },
  });
  // Rounded to 2 decimals to avoid floating point noise.
  const earnedMap = new Map(
    earned.map((e) => [e.userId, Math.round(Number(e._sum.amount ?? 0) * 100) / 100]),
  );

  // The client component only gets plain (serializable) data.
  const rows: PartnerRow[] = partners.map((p) => ({
    id: p.id,
    name: p.name,
    mobile: p.mobile ?? null,
    referralCode: p.referralCode ?? null,
    isActive: p.isActive,
    districtId: p.districtId ?? null,
    district: p.district?.name ?? null,
    parentName: p.parent?.name ?? null,
    parentCode: p.parent?.referralCode ?? null,
    referrals: p._count.children,
    students: p._count.students,
    earned: earnedMap.get(p.id) ?? 0,
  }));

  return <PartnersView partners={rows} districts={districts} />;
}