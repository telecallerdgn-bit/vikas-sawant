"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Coins, GraduationCap, Inbox, Phone, Search, UserCheck, Users } from "lucide-react";
import PartnerStatusButton from "@/components/PartnerStatusButton";
import PartnerDistrictSelect from "@/components/PartnerDistrictSelect";
import { DISPLAY } from "@/lib/ui";

export type PartnerRow = {
  id: number;
  name: string;
  mobile: string | null;
  referralCode: string | null;
  isActive: boolean;
  districtId: number | null;
  district: string | null;
  parentName: string | null;
  parentCode: string | null;
  referrals: number;
  students: number;
  earned: number;
};

export type DistrictOption = { id: number; name: string };

type Filter = "all" | "active" | "suspended";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

const AVATARS = [
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
];

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

function StatCard({
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
      <p className={`${DISPLAY} mt-4 text-3xl font-bold tracking-tight lining-nums text-slate-900`}>{value}</p>
      <p className="mt-1 text-sm text-slate-500">{sub}</p>
    </div>
  );
}

export default function PartnersView({
  partners,
  districts,
}: {
  partners: PartnerRow[];
  districts: DistrictOption[];
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const active = partners.filter((p) => p.isActive).length;
  const suspended = partners.length - active;
  const totalStudents = partners.reduce((a, p) => a + p.students, 0);
  const totalEarned = partners.reduce((a, p) => a + p.earned, 0);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return partners.filter((p) => {
      if (filter === "active" && !p.isActive) return false;
      if (filter === "suspended" && p.isActive) return false;
      if (!term) return true;
      return [p.name, p.mobile, p.referralCode, p.district].some((v) => v?.toLowerCase().includes(term));
    });
  }, [partners, q, filter]);

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: partners.length },
    { key: "active", label: "Active", count: active },
    { key: "suspended", label: "Suspended", count: suspended },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total partners"
          value={String(partners.length)}
          sub="All partner accounts"
          icon={Users}
          card="border-sky-100 from-sky-50 to-blue-100/70"
          iconBox="bg-blue-500 text-white"
          labelCls="text-blue-700"
        />
        <StatCard
          label="Active"
          value={String(active)}
          sub={`${suspended} suspended`}
          icon={UserCheck}
          card="border-emerald-100 from-emerald-50 to-green-100/70"
          iconBox="bg-emerald-500 text-white"
          labelCls="text-emerald-700"
        />
        <StatCard
          label="Total students"
          value={String(totalStudents)}
          sub="Brought in by partners"
          icon={GraduationCap}
          card="border-violet-100 from-violet-50 to-purple-100/70"
          iconBox="bg-violet-500 text-white"
          labelCls="text-violet-700"
        />
        <StatCard
          label="Total earned"
          value={inr.format(totalEarned)}
          sub="Commission credited"
          icon={Coins}
          card="border-orange-100 from-orange-50 to-amber-100/70"
          iconBox="bg-orange-500 text-white"
          labelCls="text-orange-700"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, mobile, code or district"
            aria-label="Search partners"
            className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
          />
        </div>

        <div role="group" aria-label="Filter by status" className="flex rounded-full border border-slate-200 bg-white p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              aria-pressed={filter === t.key}
              onClick={() => setFilter(t.key)}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                filter === t.key ? "bg-blue-600 font-medium text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t.label} <span className="opacity-70">({t.count})</span>
            </button>
          ))}
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className={`${DISPLAY} text-lg font-semibold text-slate-900`}>
            {filter === "all" ? "All partners" : filter === "active" ? "Active partners" : "Suspended partners"}
          </h2>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            {rows.length} {rows.length === partners.length ? "total" : "shown"}
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center border-t border-slate-100 py-14 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-500">
              <Inbox className="h-8 w-8" />
            </span>
            <p className="mt-3 font-medium text-slate-700">
              {partners.length === 0 ? "No partners yet." : "No partners match your search."}
            </p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              {partners.length === 0
                ? "Partners appear here once an application is approved and the fee is paid."
                : "Try a different name, mobile number or code."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Partner</th>
                  <th className="px-4 py-3 font-semibold">Referral code</th>
                  <th className="px-4 py-3 font-semibold">Referred by</th>
                  <th className="px-4 py-3 font-semibold">District</th>
                  <th className="px-4 py-3 text-right font-semibold">Referrals</th>
                  <th className="px-4 py-3 text-right font-semibold">Students</th>
                  <th className="px-4 py-3 text-right font-semibold">Earned</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarClass(p.name)}`}
                        >
                          {initials(p.name)}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">{p.name}</p>
                          <p className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone className="h-3.5 w-3.5" />
                            {p.mobile ?? "No mobile"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {p.referralCode ? (
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-700">
                          {p.referralCode}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {p.parentName ? (
                        <div>
                          <p className="text-slate-800">{p.parentName}</p>
                          <p className="font-mono text-xs text-slate-500">{p.parentCode}</p>
                        </div>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">Direct</span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <PartnerDistrictSelect
                        key={`${p.id}-${p.districtId ?? "none"}`}
                        partnerId={p.id}
                        partnerName={p.name}
                        currentId={p.districtId}
                        districts={districts}
                      />
                    </td>

                    <td className="px-4 py-4 text-right lining-nums">{p.referrals}</td>
                    <td className="px-4 py-4 text-right font-medium lining-nums">{p.students}</td>
                    <td className="px-4 py-4 text-right font-mono lining-nums">{inr.format(p.earned)}</td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {p.isActive ? "Active" : "Suspended"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <PartnerStatusButton id={p.id} name={p.name} isActive={p.isActive} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}