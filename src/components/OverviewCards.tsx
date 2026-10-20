import { prisma } from "@/lib/prisma";
import Icon, { type IconName } from "@/components/icons";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

type Card = { label: string; value: string; hint: string; icon: IconName; tone: string };

export default async function OverviewCards() {
  const [total, partners, inactive, paid, pending, newApps, toPack] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "PARTNER", isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: { _all: true } }),
    prisma.payout.aggregate({
      where: { status: { in: ["REQUESTED", "APPROVED"] } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.partnerApplication.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    prisma.shipment.count({ where: { status: "AWAITING_PACKING" } }),
  ]);

  const cards: Card[] = [
    {
      label: "Paid sales",
      value: inr.format(Number(paid._sum.amount ?? 0)),
      hint: `${paid._count._all} paid orders`,
      icon: "rupee",
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Pending payouts",
      value: inr.format(Number(pending._sum.amount ?? 0)),
      hint: `${pending._count._all} requests waiting`,
      icon: "wallet",
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "New applications",
      value: String(newApps),
      hint: "Submitted or under review",
      icon: "file",
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "Shipments to pack",
      value: String(toPack),
      hint: "Awaiting packing",
      icon: "package",
      tone: "bg-violet-50 text-violet-700",
    },
    {
      label: "Total users",
      value: String(total),
      hint: "All roles",
      icon: "users",
      tone: "bg-gray-100 text-gray-700",
    },
    {
      label: "Active partners",
      value: String(partners),
      hint: "Currently active",
      icon: "userCheck",
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Inactive accounts",
      value: String(inactive),
      hint: "Disabled users",
      icon: "userX",
      tone: "bg-red-50 text-red-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{c.label}</p>
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.tone}`}>
              <Icon name={c.icon} className="h-[18px] w-[18px]" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-gray-900">{c.value}</p>
          <p className="mt-1 text-xs text-gray-500">{c.hint}</p>
        </div>
      ))}
    </div>
  );
}