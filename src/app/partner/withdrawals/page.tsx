import Link from "next/link";
import { Suspense } from "react";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Clock, Info, Inbox, Landmark, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});
const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

const PILL: Record<string, string> = {
  REQUESTED: "bg-amber-100 text-amber-800",
  APPROVED: "bg-blue-100 text-blue-700",
  PAID: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

const LABEL: Record<string, string> = {
  REQUESTED: "Requested",
  APPROVED: "Approved",
  PAID: "Paid",
  REJECTED: "Rejected",
};

function Card({
  label,
  value,
  sub,
  icon: Icon,
  card,
  iconBox,
  labelCls,
}: {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  card: string;
  iconBox: string;
  labelCls: string;
}) {
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 ${card}`}>
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBox}`}>
          <Icon className="h-5 w-5" />
        </span>
        <p className={`text-xs font-semibold uppercase tracking-wider ${labelCls}`}>{label}</p>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight lining-nums text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{sub}</p>
    </div>
  );
}

async function WithdrawalsView() {
  const session = await getSession();
  const payouts = session
    ? await prisma.payout.findMany({
        where: { userId: session.userId },
        orderBy: { requestedAt: "desc" },
        take: 50,
      })
    : [];

  const sum = (statuses: string[]) =>
    payouts.filter((p) => statuses.includes(p.status)).reduce((a, p) => a + Number(p.amount), 0);

  const waiting = payouts.filter((p) => p.status === "REQUESTED" || p.status === "APPROVED");
  const paid = payouts.filter((p) => p.status === "PAID");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card
          label="In process"
          value={inr.format(sum(["REQUESTED", "APPROVED"]))}
          sub={`${waiting.length} request${waiting.length === 1 ? "" : "s"} waiting`}
          icon={Clock}
          card="border-amber-100 from-amber-50 to-orange-100/70"
          iconBox="bg-orange-500 text-white"
          labelCls="text-orange-700"
        />
        <Card
          label="Paid to you"
          value={inr.format(sum(["PAID"]))}
          sub={`${paid.length} payment${paid.length === 1 ? "" : "s"} received`}
          icon={CheckCircle2}
          card="border-emerald-100 from-emerald-50 to-green-100/70"
          iconBox="bg-emerald-500 text-white"
          labelCls="text-emerald-700"
        />
        <Card
          label="All requests"
          value={String(payouts.length)}
          sub="Since you joined"
          icon={Wallet}
          card="border-violet-100 from-violet-50 to-purple-100/70"
          iconBox="bg-violet-500 text-white"
          labelCls="text-violet-700"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">
        {/* Request form (layout only, not connected yet) */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Wallet className="h-5 w-5" />
            </span>
            Request a withdrawal
          </h2>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                <input
                  disabled
                  placeholder="0.00"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-8 pr-3 text-sm disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              <p>
                Money is sent to the bank account saved in{" "}
                <Link href="/partner/profile" className="font-medium text-blue-600 hover:underline">
                  Profile &amp; Bank
                </Link>
                .
              </p>
            </div>

            <button
              disabled
              className="w-full cursor-not-allowed rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white opacity-50"
            >
              Request withdrawal
            </button>
            <p className="text-xs text-slate-500">
              Withdrawals open once commission is credited to your wallet.
            </p>
          </div>
        </section>

        {/* History */}
        <section className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Withdrawal history</h2>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {payouts.length} total
            </span>
          </div>

          {payouts.length === 0 ? (
            <div className="flex flex-col items-center border-t border-slate-100 py-12 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-500">
                <Inbox className="h-8 w-8" />
              </span>
              <p className="mt-3 font-medium text-slate-700">No withdrawals yet.</p>
              <p className="mt-1 max-w-xs text-sm text-slate-500">
                Your withdrawal requests and their status will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Request</th>
                    <th className="px-4 py-3 text-right font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">UTR</th>
                    <th className="px-4 py-3 font-semibold">Requested</th>
                    <th className="px-4 py-3 font-semibold">Paid on</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100 align-top hover:bg-slate-50/60">
                      <td className="px-5 py-4 font-mono">#{p.id}</td>
                      <td className="px-4 py-4 text-right font-mono lining-nums">{inr.format(Number(p.amount))}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PILL[p.status]}`}>
                          {LABEL[p.status]}
                        </span>
                        {p.status === "REJECTED" && p.note && (
                          <p className="mt-1 max-w-[12rem] text-xs text-red-600">{p.note}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs">
                        {p.utr ?? <span className="text-slate-400">—</span>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-600">{dateFmt.format(p.requestedAt)}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                        {p.paidAt ? dateFmt.format(p.paidAt) : <span className="text-slate-400">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
        <Info className="mt-0.5 h-[18px] w-[18px] shrink-0 text-amber-600" />
        <p>
          Requests are reviewed by the admin team. Once approved and paid, the bank reference (UTR) shows up here.
        </p>
      </div>
    </div>
  );
}

export default function WithdrawalsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Partner portal</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Withdrawals</h1>
        <p className="mt-1 text-sm text-slate-500">Request your earnings and track every payment.</p>
      </header>

      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <WithdrawalsView />
      </Suspense>
    </div>
  );
}