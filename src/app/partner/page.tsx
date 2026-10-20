import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import {
  getNetwork,
  getPartnerProfile,
  getStudentCount,
  getWallet,
  requirePartner,
} from "@/lib/partner";
import { formatDate, formatInr, formatInrShort, toRupees } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import StatCards, { type Stat } from "@/components/ui/StatCards";
import TableCard, { EmptyRow, TH, THEAD } from "@/components/ui/TableCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { PageSkeleton } from "@/components/ui/Skeletons";

async function OverviewView() {
  const me = await requirePartner();
  const [profile, wallet, network, students, recent] = await Promise.all([
    getPartnerProfile(me.id),
    getWallet(me.id),
    getNetwork(me.id),
    getStudentCount(me.id),
    prisma.ledgerEntry.findMany({
      where: { userId: me.id, orderId: { not: null } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 6,
      include: { order: { select: { course: { select: { name: true } } } } },
    }),
  ]);

  const members = network.reduce((sum, l) => sum + l.members.length, 0);

  const stats: Stat[] = [
    { label: "Total earned", value: formatInrShort(wallet.earned), hint: "All commission credited", icon: "trending", tone: "blue" },
    { label: "Wallet balance", value: formatInrShort(wallet.balance), hint: "After withdrawals", icon: "wallet", tone: "violet" },
    {
      label: "Available now",
      value: formatInrShort(wallet.available),
      hint: wallet.hold > 0 ? `${formatInr(wallet.hold)} on hold` : "Nothing on hold",
      icon: "rupee",
      tone: "emerald",
    },
    { label: "Students referred", value: String(students), hint: "Through your link", icon: "userCheck", tone: "orange" },
    { label: "Partners in network", value: String(members), hint: "Up to 5 levels", icon: "users", tone: "sky" },
  ];

  return (
    <div className="space-y-6">
      <StatCards items={stats} cols={5} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TableCard title="Recent commission">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className={THEAD}>
                <tr>
                  <th className={TH}>Date</th>
                  <th className={TH}>Course</th>
                  <th className={TH}>Type</th>
                  <th className={`${TH} text-right`}>Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.length === 0 && (
                  <EmptyRow colSpan={4} title="No commission yet" hint="Commission appears here when your referrals buy a course." />
                )}
                {recent.map((e) => {
                  const amount = toRupees(e.amount);
                  return (
                    <tr key={e.id} className="transition-colors hover:bg-blue-50/40">
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">{formatDate(e.createdAt)}</td>
                      <td className="px-6 py-4 text-slate-800">{e.order?.course.name ?? "—"}</td>
                      <td className="px-6 py-4">
                        <StatusBadge value={e.type} />
                      </td>
                      <td className={`px-6 py-4 text-right font-semibold tabular-nums ${amount < 0 ? "text-red-600" : "text-emerald-700"}`}>
                        {amount > 0 ? "+" : ""}
                        {formatInr(amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableCard>
        </div>

        <section className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your referral code</p>
          <p className="mt-3 font-mono text-3xl font-bold tracking-wide text-slate-900">
            {profile.referralCode ?? "—"}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {profile.district?.name ? `${profile.district.name} district · ` : ""}partner since{" "}
            {profile.createdAt.getFullYear()}
          </p>
          <Link
            href="/partner/link"
            className="mt-5 block rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700"
          >
            Get my link
          </Link>
        </section>
      </div>
    </div>
  );
}

export default function PartnerOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Overview" description="Your earnings, students and network at a glance." />
      <Suspense fallback={<PageSkeleton cards={5} />}>
        <OverviewView />
      </Suspense>
    </div>
  );
}