import type { ApplicationStatus } from "@prisma/client";
import { Check, Inbox, Mail, MapPin, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ApplicationActions from "@/components/ApplicationActions";
import ExpandableText from "@/components/ExpandableText";
import { DISPLAY } from "@/lib/ui";

const STATUS: Record<string, { label: string; cls: string }> = {
  SUBMITTED: { label: "Submitted", cls: "bg-blue-100 text-blue-700" },
  UNDER_REVIEW: { label: "Under review", cls: "bg-amber-100 text-amber-800" },
  MORE_INFO: { label: "More info", cls: "bg-violet-100 text-violet-700" },
  APPROVED: { label: "Approved", cls: "bg-cyan-100 text-cyan-700" },
  ACTIVE: { label: "Active", cls: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Rejected", cls: "bg-red-100 text-red-700" },
};

const STEP: Record<string, number> = {
  SUBMITTED: 1,
  UNDER_REVIEW: 2,
  MORE_INFO: 2,
  APPROVED: 3,
  ACTIVE: 4,
};

const AVATARS = [
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
];

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function avatarClass(name: string) {
  let sum = 0;
  for (const ch of name) sum += ch.charCodeAt(0);
  return AVATARS[sum % AVATARS.length];
}

function Progress({ status }: { status: string }) {
  const s = STATUS[status];
  const n = STEP[status];

  return (
    <div className="space-y-2">
      {n && (
        <div className="flex items-center">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                  i < n
                    ? "bg-emerald-500 text-white"
                    : i === n
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {i < n ? <Check className="h-3 w-3" /> : i}
              </span>
              {i < 4 && <span className={`h-0.5 w-3 ${i < n ? "bg-emerald-400" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>
      )}
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span>
    </div>
  );
}

export default async function ApplicationsTable({ status }: { status?: string }) {
  const where = status ? { status: status as ApplicationStatus } : {};

  const apps = await prisma.partnerApplication.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      district: { select: { name: true } },
      sponsor: { select: { name: true, referralCode: true } },
    },
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className={`${DISPLAY} text-lg font-semibold text-slate-900`}>
          {status ? "Filtered applications" : "All applications"}
        </h2>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          {apps.length} {status ? "shown" : "total"}
        </span>
      </div>

      {apps.length === 0 ? (
        <div className="flex flex-col items-center border-t border-slate-100 py-14 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-500">
            <Inbox className="h-8 w-8" />
          </span>
          <p className="mt-3 font-medium text-slate-700">No applications here.</p>
          <p className="mt-1 max-w-xs text-sm text-slate-500">
            New partner applications will appear here as soon as someone applies.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Applicant</th>
                <th className="px-4 py-3 font-semibold">District</th>
                <th className="px-4 py-3 font-semibold">Sponsor</th>
                <th className="px-4 py-3 font-semibold">Experience</th>
                <th className="px-4 py-3 font-semibold">Fee</th>
                <th className="px-4 py-3 font-semibold">Progress</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id} className="border-t border-slate-100 align-top hover:bg-slate-50/60">
                  <td className="px-5 py-4">
                    <div className="flex gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarClass(a.name)}`}
                      >
                        {initials(a.name)}
                      </span>
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-semibold text-slate-900">{a.name}</p>
                        <p className="flex items-center gap-1.5 break-all text-xs text-slate-500">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          {a.email}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          {a.mobile}
                        </p>
                        {a.panMasked && <p className="font-mono text-[11px] text-slate-400">PAN {a.panMasked}</p>}
                        <p className="text-[11px] text-slate-400">Applied {dateFmt.format(a.createdAt)}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {a.district ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                        <MapPin className="h-3 w-3" />
                        {a.district.name}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {a.sponsor ? (
                      <div>
                        <p className="text-slate-800">{a.sponsor.name}</p>
                        <p className="font-mono text-xs text-slate-500">{a.sponsor.referralCode}</p>
                      </div>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">Direct</span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-slate-700">
                    <ExpandableText text={a.experience} />
                    {a.note && (
                      <p className="mt-1 max-w-xs rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">
                        Note: {a.note}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        a.feePaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      ₹ {a.feePaid ? "Paid" : "Unpaid"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <Progress status={a.status} />
                  </td>

                  <td className="px-4 py-4">
                    <ApplicationActions id={a.id} status={a.status} feePaid={a.feePaid} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}