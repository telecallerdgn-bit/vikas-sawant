import { Suspense } from "react";
import type { LucideIcon } from "lucide-react";
import { Check, CheckCircle2, Clock, FileText, IndianRupee, Info } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// Fixed one-time fee quoted in the application and in messages. It is not stored per application.
const REGISTRATION_FEE = 2999;

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

async function FeesView() {
  const session = await getSession();
  const app = session
    ? await prisma.partnerApplication.findUnique({
        where: { userId: session.userId },
        select: { id: true, status: true, feePaid: true, feePaidAt: true, createdAt: true },
      })
    : null;

  if (!app) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white py-14 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-500">
          <FileText className="h-8 w-8" />
        </span>
        <p className="mt-3 font-medium text-slate-700">No registration fee on record.</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Your account was created directly by the admin team, so there is no application fee to show here.
        </p>
      </div>
    );
  }

  const approved = app.status === "APPROVED" || app.status === "ACTIVE";
  const active = app.status === "ACTIVE";

  const steps: { label: string; done: boolean; date: Date | null; note?: string }[] = [
    { label: "Application submitted", done: true, date: app.createdAt },
    { label: "Application approved", done: approved, date: null },
    { label: "Fee confirmed", done: app.feePaid, date: app.feePaidAt },
    { label: "Account active", done: active, date: null },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card
          label="Registration fee"
          value={inr.format(REGISTRATION_FEE)}
          sub="One-time registration & training"
          icon={IndianRupee}
          card="border-sky-100 from-sky-50 to-blue-100/70"
          iconBox="bg-blue-500 text-white"
          labelCls="text-blue-700"
        />
        <Card
          label="Fee status"
          value={app.feePaid ? "Paid" : "Unpaid"}
          sub={app.feePaid ? "Confirmed by the admin team" : "Waiting for confirmation"}
          icon={app.feePaid ? CheckCircle2 : Clock}
          card={
            app.feePaid
              ? "border-emerald-100 from-emerald-50 to-green-100/70"
              : "border-amber-100 from-amber-50 to-orange-100/70"
          }
          iconBox={app.feePaid ? "bg-emerald-500 text-white" : "bg-orange-500 text-white"}
          labelCls={app.feePaid ? "text-emerald-700" : "text-orange-700"}
        />
        <Card
          label="Paid on"
          value={app.feePaidAt ? dateFmt.format(app.feePaidAt) : "—"}
          sub={app.feePaidAt ? "Date the fee was confirmed" : "Not paid yet"}
          icon={FileText}
          card="border-violet-100 from-violet-50 to-purple-100/70"
          iconBox="bg-violet-500 text-white"
          labelCls="text-violet-700"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        {/* Progress */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Registration progress</h2>
          <p className="text-xs text-slate-500">Application #{app.id}</p>

          <ol className="mt-5">
            {steps.map((s, i) => (
              <li key={s.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                      s.done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {s.done ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                  {i < steps.length - 1 && (
                    <span className={`my-1 w-0.5 flex-1 ${s.done ? "bg-emerald-300" : "bg-slate-200"}`} />
                  )}
                </div>
                <div className="pb-6">
                  <p className={`text-sm font-medium ${s.done ? "text-slate-900" : "text-slate-400"}`}>{s.label}</p>
                  {s.date && <p className="text-xs text-slate-500">{dateFmt.format(s.date)}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Receipt */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Fee details</h2>

          <dl className="mt-4 divide-y divide-slate-100 text-sm">
            <div className="flex justify-between py-3">
              <dt className="text-slate-500">Item</dt>
              <dd className="font-medium text-slate-900">Registration &amp; training</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-slate-500">Amount</dt>
              <dd className="font-mono font-medium lining-nums text-slate-900">{inr.format(REGISTRATION_FEE)}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-slate-500">Status</dt>
              <dd>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    app.feePaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {app.feePaid ? "Paid" : "Unpaid"}
                </span>
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-slate-500">Confirmed on</dt>
              <dd className="text-slate-900">{app.feePaidAt ? dateFmt.format(app.feePaidAt) : "—"}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
        <Info className="mt-0.5 h-[18px] w-[18px] shrink-0 text-amber-600" />
        <p>
          The fee is confirmed by the admin team after it is received. Your account stays active only when your
          application is approved and the fee is paid.
        </p>
      </div>
    </div>
  );
}

export default function FeesPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Partner portal</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Registration Fees</h1>
        <p className="mt-1 text-sm text-slate-500">Your one-time registration and training fee.</p>
      </header>

      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <FeesView />
      </Suspense>
    </div>
  );
}