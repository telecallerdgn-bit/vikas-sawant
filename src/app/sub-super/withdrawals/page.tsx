import { Suspense } from "react";
import { CheckCircle2, Clock, Info, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSubSuper } from "@/lib/subsuper";
import { Card, Empty, PAYOUT_PILL, PageHeader, Pill, StatCard, THEAD, TH, fmtDate, inr } from "@/components/subsuper/ui";

async function View() {
  const me = await requireSubSuper();

  const payouts = await prisma.payout.findMany({
    where: { userId: me.id }, // only this user's own payouts
    orderBy: { requestedAt: "desc" },
    take: 50,
  });

  const sum = (statuses: string[]) =>
    payouts.filter((p) => statuses.includes(p.status)).reduce((a, p) => a + Number(p.amount), 0);
  const waiting = payouts.filter((p) => p.status === "REQUESTED" || p.status === "APPROVED").length;
  const paid = payouts.filter((p) => p.status === "PAID").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="In process"
          value={inr.format(sum(["REQUESTED", "APPROVED"]))}
          sub={`${waiting} request${waiting === 1 ? "" : "s"} waiting`}
          icon={Clock}
          tone="orange"
        />
        <StatCard
          label="Paid to you"
          value={inr.format(sum(["PAID"]))}
          sub={`${paid} payment${paid === 1 ? "" : "s"} received`}
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard label="All requests" value={String(payouts.length)} sub="Since you joined" icon={Wallet} tone="purple" />
      </div>

      <Card title="Withdrawal history" badge={`${payouts.length} total`}>
        {payouts.length === 0 ? (
          <Empty title="No withdrawals yet." text="Your payout requests and their status will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={THEAD}>
                <tr>
                  <th className="px-5 py-3 font-semibold">Request</th>
                  <th className={`${TH} text-right`}>Amount</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>UTR</th>
                  <th className={TH}>Requested</th>
                  <th className={TH}>Paid on</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 align-top hover:bg-slate-50/60">
                    <td className="px-5 py-4 font-mono">#{p.id}</td>
                    <td className="px-4 py-4 text-right font-mono lining-nums">{inr.format(Number(p.amount))}</td>
                    <td className="px-4 py-4">
                      <Pill cls={PAYOUT_PILL[p.status].cls}>{PAYOUT_PILL[p.status].label}</Pill>
                      {p.status === "REJECTED" && p.note && (
                        <p className="mt-1 max-w-[12rem] text-xs text-red-600">{p.note}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs">{p.utr ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">{fmtDate.format(p.requestedAt)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      {p.paidAt ? fmtDate.format(p.paidAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
        <Info className="mt-0.5 h-[18px] w-[18px] shrink-0 text-amber-600" />
        <p>To request a payout, please contact the admin team. Once paid, the bank reference (UTR) shows up here.</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Withdrawals" subtitle="Your payouts and their status." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View />
      </Suspense>
    </div>
  );
}