import { prisma } from "@/lib/prisma";
import PartnerStatusButton from "@/components/PartnerStatusButton";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

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

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-emerald-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="p-4">Partner</th>
            <th className="p-4">Referral code</th>
            <th className="p-4">Referred by</th>
            <th className="p-4">District</th>
            <th className="p-4 text-right">Referrals</th>
            <th className="p-4 text-right">Students</th>
            <th className="p-4 text-right">Earned</th>
            <th className="p-4">Status</th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody>
          {partners.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-4">
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-gray-500">{p.mobile ?? "-"}</p>
              </td>
              <td className="p-4 font-mono">{p.referralCode ?? "-"}</td>
              <td className="p-4">
                {p.parent ? (
                  <>
                    <p>{p.parent.name}</p>
                    <p className="font-mono text-xs text-gray-500">{p.parent.referralCode}</p>
                  </>
                ) : (
                  "—"
                )}
              </td>
              <td className="p-4">{p.district?.name ?? "—"}</td>
              <td className="p-4 text-right">{p._count.children}</td>
              <td className="p-4 text-right">{p._count.students}</td>
              <td className="p-4 text-right font-mono">{inr.format(earnedMap.get(p.id) ?? 0)}</td>
              <td className="p-4">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                    p.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {p.isActive ? "Active" : "Suspended"}
                </span>
              </td>
              <td className="p-4 text-right">
                <PartnerStatusButton id={p.id} isActive={p.isActive} />
              </td>
            </tr>
          ))}
          {partners.length === 0 && (
            <tr>
              <td colSpan={9} className="p-6 text-center text-gray-500">
                No partners yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}