"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Handshake,
  Layers,
  MapPin,
  Package,
  ShieldCheck,
  UserCog,
  Wallet,
} from "lucide-react";
import { SITE } from "@/lib/site-config";
import AuthShell, { type AuthPerk } from "@/components/site/AuthShell";

const roles: { label: string; value: string; icon: LucideIcon; hint: string }[] = [
  { label: "Admin", value: "admin", icon: ShieldCheck, hint: "Full control" },
  { label: "Partner", value: "partner", icon: Handshake, hint: "Referrals and earnings" },
  { label: "District Admin", value: "district", icon: MapPin, hint: "Your district" },
  { label: "Sub Super", value: "sub-super", icon: UserCog, hint: "Manage your team" },
  { label: "Finance", value: "finance", icon: Wallet, hint: "Payments and payouts" },
  { label: "Packing", value: "packing", icon: Package, hint: "Orders and dispatch" },
];

const PERKS: AuthPerk[] = [
  { icon: ShieldCheck, title: "Role-based access", text: "Every role sees only what it needs." },
  { icon: Layers, title: "Everything in one place", text: "Orders, centres, finance and packing." },
  { icon: Handshake, title: "Partners are welcome", text: "Apply to start earning on enrolments." },
];

export default function PortalPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const selected = roles.find((r) => r.value === role);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (role) router.push(`/login?role=${role}`);
  }

  return (
    <AuthShell
      wide
      badge="Management portal"
      title={
        <>
          One portal,
          <br />
          <span className="italic text-gold-400">for the whole team</span>
        </>
      }
      text="Choose your role to log in and manage your work."
      perks={PERKS}
    >
      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-3xl border border-white bg-white p-7 shadow-2xl shadow-brand-900/10 sm:p-9"
      >
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3.5 py-1 text-xs font-semibold text-brand-800">
            <ShieldCheck className="h-3.5 w-3.5" /> Management portal
          </span>
          <h2 className="mt-4 text-3xl font-black text-brand-900">{SITE.brand}</h2>
          <p className="mt-1.5 text-sm text-slate-500">Select your role to continue.</p>
        </div>

        {/* Role cards (pehle dropdown tha) */}
        <div>
          <p id="role-label" className="mb-3 text-sm font-bold text-brand-900">
            Role
          </p>
          <div role="radiogroup" aria-labelledby="role-label" className="grid gap-3 sm:grid-cols-2">
            {roles.map((r) => {
              const Icon = r.icon;
              const active = role === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setRole(r.value)}
                  className={`group relative flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 ${
                    active
                      ? "border-gold-400 bg-gold-100/50 shadow-md"
                      : "border-brand-100 bg-white hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition duration-200 ${
                      active
                        ? "bg-brand-900 text-gold-400"
                        : "bg-brand-50 text-brand-700 group-hover:bg-brand-900 group-hover:text-gold-400"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black text-brand-900">{r.label}</span>
                    <span className="block truncate text-xs text-slate-500">{r.hint}</span>
                  </span>
                  {active && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-gold-400 text-brand-900">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <button
          disabled={!role}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-900/20 transition hover:bg-brand-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {selected ? `Login as ${selected.label}` : "Login"}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </button>

        <div className="relative py-1 text-center">
          <span className="absolute inset-x-0 top-1/2 border-t border-brand-100" />
          <span className="relative bg-white px-3 text-xs text-slate-400">Want to become a partner?</span>
        </div>

        <Link
          href="/partner-apply"
          className="flex w-full items-center justify-center rounded-xl border-2 border-gold-400 px-5 py-3 text-sm font-bold text-brand-900 transition hover:bg-gold-100/60 active:scale-[0.98]"
        >
          Apply here
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-400">
          <Link href="/student/login" className="transition hover:text-brand-900">
            Student login
          </Link>
          <Link href="/" className="flex items-center gap-1.5 transition hover:text-brand-900">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to website
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}