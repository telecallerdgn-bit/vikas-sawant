import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Coins, FileText, GraduationCap, Info, Package, Percent, ShoppingBag, UserCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SHARE_TYPE, requireSubSuper } from "@/lib/subsuper";
import {
  Avatar,
  Card,
  Empty,
  MODE_LABEL,
  ORDER_PILL,
  PageHeader,
  Pill,
  StatCard,
  THEAD,
  TH,
  fmtDate,
  inr,
} from "@/components/subsuper/ui";

async function Overview() {
  const me = await requireSubSuper();

  const [paid, students, partners, pendingApps, toPack, share, orders] = await Promise.all([
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: { _all: true } }),
    prisma.student.count(),
    prisma.user.count({ where: { role: "PARTNER", isActive: true } }),
    prisma.partnerApplication.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    prisma.shipment.count({ where: { status: "AWAITING_PACKING" } }),
    prisma.ledgerEntry.aggregate({ where: { userId: me.id, type: SHARE_TYPE }, _sum: { amount: true } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        student: { select: { name: true } },
        course: { select: { name: true, mode: true } },
        partner: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-slate-700">
        <Info className="mt-0.5 h-[18px] w-[18px] shrink-0 text-sky-600" />
        <p>Sub Super Admin view: reports are visible, settings and approvals are read-only.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Paid sales"
          value={inr.format(Number(paid._sum.amount ?? 0))}
          sub={`${paid._count._all} paid orders`}
          icon={Coins}
          tone="blue"
        />
        <StatCard label="Students" value={String(students)} sub="Total students" icon={GraduationCap} tone="purple" />
        <StatCard label="Active partners" value={String(partners)} sub="Currently active" icon={UserCheck} tone="green" />
        <StatCard
          label="Pending applications"
          value={String(pendingApps)}
          sub="Submitted or under review"
          icon={FileText}
          tone="orange"
        />
        <StatCard label="Books to pack" value={String(toPack)} sub="Awaiting packing" icon={Package} tone="cyan" />
        <StatCard
          label="Your share"
          value={inr.format(Number(share._sum.amount ?? 0))}
          sub="Credited to you"
          icon={Percent}
          tone="rose"
        />
      </div>

      <Card title="Latest orders" badge={`${orders.length} shown`}>
        {orders.length === 0 ? (
          <Empty title="No orders yet." text="Orders appear here as students buy courses." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={THEAD}>
                <tr>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className={TH}>Student</th>
                  <th className={TH}>Course</th>
                  <th className={TH}>Partner</th>
                  <th className={`${TH} text-right`}>Amount</th>
                  <th className={TH}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-slate-100 align-top hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <p className="font-mono">#{o.id}</p>
                      <p className="text-xs text-slate-400">{fmtDate.format(o.createdAt)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={o.student.name} />
                        <span className="font-medium text-slate-900">{o.student.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-slate-800">{o.course.name}</p>
                      <p className="text-xs text-slate-500">{MODE_LABEL[o.course.mode]}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{o.partner?.name ?? "Direct"}</td>
                    <td className="px-4 py-4 text-right font-mono lining-nums">{inr.format(Number(o.amount))}</td>
                    <td className="px-4 py-4">
                      <Pill cls={ORDER_PILL[o.status].cls}>{ORDER_PILL[o.status].label}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-slate-100 px-5 py-3 text-right">
          <Link href="/sub-super/orders" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
            View all orders <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function SubSuperOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Overview" subtitle="Reports across the platform, and your own share." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <Overview />
      </Suspense>
    </div>
  );
}