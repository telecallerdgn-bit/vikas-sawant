import { Suspense } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  GraduationCap,
  Info,
  Landmark,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Ticket,
  UserCheck,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import CopyCode from "@/components/CopyCode";
import { initials } from "@/lib/format";

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <div className="mt-0.5 break-words text-sm font-medium text-slate-900">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, mono = false }: { label: string; placeholder: string; mono?: boolean }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</label>
      <input
        disabled
        placeholder={placeholder}
        className={`mt-1 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm ${
          mono ? "font-mono" : ""
        }`}
      />
    </div>
  );
}

async function ProfileView() {
  const session = await getSession();
  const me = session
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          name: true,
          email: true,
          mobile: true,
          referralCode: true,
          isActive: true,
          createdAt: true,
          district: { select: { name: true } },
          parent: { select: { name: true, referralCode: true } },
          _count: { select: { children: true, students: true } },
        },
      })
    : null;

  if (!me) {
    return <p className="text-sm text-slate-500">Could not load your profile. Please log in again.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <section className="flex flex-wrap items-center gap-5 rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-100 p-6">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-900/20">
          {initials(me.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-2xl font-bold text-slate-900">{me.name}</h2>
          <p className="mt-0.5 text-sm text-slate-600">Partner</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                me.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {me.isActive ? "Active" : "Suspended"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-600">
              <CalendarDays className="h-3.5 w-3.5" />
              Member since {dateFmt.format(me.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="rounded-2xl bg-white/70 px-5 py-3 text-center">
            <p className="text-2xl font-bold lining-nums text-slate-900">{me._count.children}</p>
            <p className="text-xs text-slate-500">Referrals</p>
          </div>
          <div className="rounded-2xl bg-white/70 px-5 py-3 text-center">
            <p className="text-2xl font-bold lining-nums text-slate-900">{me._count.students}</p>
            <p className="text-xs text-slate-500">Students</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Personal details (read only) */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <UserCheck className="h-5 w-5" />
            </span>
            Personal details
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Detail icon={Mail} label="Email">
              {me.email}
            </Detail>
            <Detail icon={Phone} label="Mobile">
              {me.mobile ?? <span className="text-slate-400">Not added</span>}
            </Detail>
            <Detail icon={MapPin} label="District">
              {me.district?.name ?? <span className="text-slate-400">Not assigned</span>}
            </Detail>
            <Detail icon={Users} label="Referred by">
              {me.parent ? (
                <>
                  {me.parent.name}
                  <span className="ml-1 font-mono text-xs text-slate-500">{me.parent.referralCode}</span>
                </>
              ) : (
                <span className="text-slate-500">Direct</span>
              )}
            </Detail>
          </div>

          <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Ticket className="h-4 w-4" />
              Your referral code
            </p>
            <div className="mt-2">
              {me.referralCode ? (
                <CopyCode code={me.referralCode} />
              ) : (
                <p className="text-sm text-slate-500">No code assigned yet.</p>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 text-xs text-slate-500">
            <GraduationCap className="mt-0.5 h-4 w-4 shrink-0" />
            <p>To change your name, email or mobile number, please contact support.</p>
          </div>
        </section>

        {/* Bank details (layout only) */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Landmark className="h-5 w-5" />
              </span>
              Bank details
            </h2>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Not added
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Account holder name" placeholder="Name as on bank account" />
            </div>
            <Field label="Bank name" placeholder="e.g. State Bank of India" />
            <Field label="IFSC code" placeholder="SBIN0001234" mono />
            <div className="sm:col-span-2">
              <Field label="Account number" placeholder="Account number" mono />
            </div>
            <div className="sm:col-span-2">
              <Field label="UPI ID (optional)" placeholder="name@bank" />
            </div>
          </div>

          <button
            disabled
            className="mt-4 w-full cursor-not-allowed rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white opacity-50"
          >
            Save bank details
          </button>

          <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <p>Your withdrawals are sent to this account. Bank details will open for editing soon.</p>
          </div>
        </section>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
        <Info className="mt-0.5 h-[18px] w-[18px] shrink-0 text-amber-600" />
        <p className="flex items-center gap-2">
          <ShieldCheck className="hidden h-4 w-4 shrink-0 text-amber-600 sm:block" />
          Keep your details correct. Withdrawals can only be paid to a verified bank account in your own name.
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Partner portal</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Profile &amp; Bank</h1>
        <p className="mt-1 text-sm text-slate-500">Your account details and where your earnings are sent.</p>
      </header>

      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <ProfileView />
      </Suspense>
    </div>
  );
}