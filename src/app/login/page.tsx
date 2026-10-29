"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Handshake,
  Layers,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Package,
  ShieldCheck,
  UserCog,
  Wallet,
} from "lucide-react";
import AuthShell, { type AuthPerk } from "@/components/site/AuthShell";

const allowedRoles = ["admin", "partner", "district", "sub-super", "finance", "packing"];

const roleLabels: Record<string, string> = {
  admin: "Admin",
  partner: "Partner",
  district: "District Admin",
  "sub-super": "Sub Super",
  finance: "Finance",
  packing: "Packing",
};

const roleIcons: Record<string, LucideIcon> = {
  admin: ShieldCheck,
  partner: Handshake,
  district: MapPin,
  "sub-super": UserCog,
  finance: Wallet,
  packing: Package,
};

const PERKS: AuthPerk[] = [
  { icon: ShieldCheck, title: "Role-based access", text: "Every role sees only what it needs." },
  { icon: Layers, title: "Everything in one place", text: "Orders, centres, finance and packing." },
  { icon: Lock, title: "Secure sign in", text: "Your account stays protected." },
];

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const role = params.get("role") ?? "";
  const validRole = allowedRoles.includes(role);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!validRole) router.replace("/portal");
  }, [validRole, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, portal: role }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      window.location.href = data.redirect;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!validRole) return null;

  const label = roleLabels[role];
  const RoleIcon = roleIcons[role];

  const inputCls =
    "w-full rounded-xl border border-brand-100 bg-brand-50/60 py-3.5 pl-12 pr-4 text-sm text-brand-900 outline-none transition placeholder:text-slate-400 focus:border-gold-400 focus:bg-white focus:ring-4 focus:ring-gold-400/20";
  const iconCls = "pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-600";

  return (
    <AuthShell
      badge={`${label} portal`}
      title={
        <>
          Sign in to the
          <br />
          <span className="italic text-gold-400">{label} portal</span>
        </>
      }
      text="Enter your email and password to continue to your dashboard."
      perks={PERKS}
    >
      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-3xl border border-white bg-white p-7 shadow-2xl shadow-brand-900/10 sm:p-9"
      >
        <div>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-900 text-gold-400 shadow-lg shadow-brand-900/20">
            <RoleIcon className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-3xl font-bold text-brand-900">{label} Login</h2>
          <p className="mt-1.5 text-sm text-slate-500">Enter your email and password.</p>
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-brand-900">
            Email
          </label>
          <div className="relative">
            <Mail className={iconCls} />
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-brand-900">
            Password
          </label>
          <div className="relative">
            <Lock className={iconCls} />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputCls} pr-12`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-brand-50 hover:text-brand-900"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-900/20 transition hover:bg-brand-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Please wait...
            </>
          ) : (
            <>
              Login <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </>
          )}
        </button>

        <Link
          href="/portal"
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gold-400 px-5 py-3 text-sm font-bold text-brand-900 transition hover:bg-gold-100/60 active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" /> Change role
        </Link>

        <Link
          href="/"
          className="flex items-center justify-center text-xs font-semibold text-slate-400 transition hover:text-brand-900"
        >
          Back to website
        </Link>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}