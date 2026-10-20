import { prisma } from "@/lib/prisma";
import PartnersView, { type PartnerRow } from "@/components/PartnersView";

export default async function PartnersTable() {
  const partners = await prisma.user.findMany({
    where: { role: "PARTNER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      mobile: true,
      referralCode: true,
      isActive: true,
      district: { select: { name: true } },
      parent: { select: { name: true, referralCode: true } },
      _count: { select: { students: true, children: true } },
    },
  });

  const earned = await prisma.ledgerEntry.groupBy({
    by: ["userId"],
    where: { type: "PARTNER_COMMISSION", userId: { in: partners.map((p) => p.id) } },
    _sum: { amount: true },
  });
  const earnedMap = new Map(earned.map((e) => [e.userId, Number(e._sum.amount ?? 0)]));

  // Client component only gets plain (serializable) data
  const rows: PartnerRow[] = partners.map((p) => ({
    id: p.id,
    name: p.name,
    mobile: p.mobile ?? null,
    referralCode: p.referralCode ?? null,
    isActive: p.isActive,
    district: p.district?.name ?? null,
    parentName: p.parent?.name ?? null,
    parentCode: p.parent?.referralCode ?? null,
    referrals: p._count.children,
    students: p._count.students,
    earned: earnedMap.get(p.id) ?? 0,
  }));

  return <PartnersView partners={rows} />;
}