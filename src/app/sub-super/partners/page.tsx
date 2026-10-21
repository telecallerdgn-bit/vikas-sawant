import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireSubSuper } from "@/lib/subsuper";
import { Avatar, Card, Empty, PageHeader, Pill, THEAD, TH, inr } from "@/components/subsuper/ui";

async function View() {
  await requireSubSuper();

  const partners = await prisma.user.findMany({
    where: { role: "PARTNER" },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      referralCode: true,
      isActive: true,
      district: { select: { name: true } },
      parent: { select: { name: true } },
      _count: { select: { students: true, children: true } },
    },
  });

  const earned = await prisma.ledgerEntry.groupBy({
    by: ["userId"],
    where: { type: "PARTNER_COMMISSION", userId: { in: partners.map((p) => p.id) } },
    _sum: { amount: true },
  });
  const earnedMap = new Map(earned.map((e) => [e.userId, Number(e._sum.amount ?? 0)]));

  return (
    <Card title="All partners" badge={`${partners.length} shown`}>
      {partners.length === 0 ? (
        <Empty title="No partners yet." text="Partners appear here once their account is active." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={THEAD}>
              <tr>
                <th className="px-5 py-3 font-semibold">Partner</th>
                <th className={TH}>Referral code</th>
                <th className={TH}>Referred by</th>
                <th className={TH}>District</th>
                <th className={`${TH} text-right`}>Referrals</th>
                <th className={`${TH} text-right`}>Students</th>
                <th className={`${TH} text-right`}>Earned</th>
                <th className={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={p.name} />
                      <span className="font-semibold text-slate-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {p.referralCode ? (
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-700">
                        {p.referralCode}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-700">{p.parent?.name ?? "Direct"}</td>
                  <td className="px-4 py-4 text-slate-700">{p.district?.name ?? "—"}</td>
                  <td className="px-4 py-4 text-right lining-nums">{p._count.children}</td>
                  <td className="px-4 py-4 text-right font-medium lining-nums">{p._count.students}</td>
                  <td className="px-4 py-4 text-right font-mono lining-nums">{inr.format(earnedMap.get(p.id) ?? 0)}</td>
                  <td className="px-4 py-4">
                    <Pill cls={p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                      {p.isActive ? "Active" : "Suspended"}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Partners" subtitle="Everyone who sells for the academy. Read-only." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View />
      </Suspense>
    </div>
  );
}