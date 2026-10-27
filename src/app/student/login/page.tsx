"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  PlayCircle,
  Smartphone,
  Truck,
} from "lucide-react";
import { SITE } from "@/lib/site-config";
import AuthShell, { type AuthPerk } from "@/components/site/AuthShell";

const PERKS: AuthPerk[] = [
  { icon: PlayCircle, title: "Live and recorded classes", text: "Learn with a teacher or watch any time." },
  { icon: BookOpen, title: "All your courses in one place", text: "Pick up exactly where you left off." },
  { icon: Truck, title: "Study material at your door", text: "Books are delivered to your address." },
];

export default function StudentLoginPage() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, password }),
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

  const inputCls =
    "w-full rounded-xl border border-brand-100 bg-brand-50/60 py-3.5 pr-4 text-sm text-brand-900 outline-none transition placeholder:text-slate-400 focus:border-gold-400 focus:bg-white focus:ring-4 focus:ring-gold-400/20";

  return (
    <AuthShell
      badge="Student portal"
      title={
        <>
          Your learning,
          <br />
          <span className="italic text-gold-400">right where you left it</span>
        </>
      }
      text="Log in to continue your courses, classes and study material."
      perks={PERKS}
    >
      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-3xl border border-white bg-white p-7 shadow-2xl shadow-brand-900/10 sm:p-9"
      >
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3.5 py-1 text-xs font-semibold text-brand-800">
            <GraduationCap className="h-3.5 w-3.5" /> Student login
          </span>
          <h2 className="mt-4 text-3xl font-black text-brand-900">Welcome back</h2>
          <p className="mt-1.5 text-sm text-slate-500">Log in with your mobile number.</p>
        </div>

        <div>
          <label htmlFor="mobile" className="mb-1.5 block text-sm font-bold text-brand-900">
            Mobile number
          </label>
          <div className="relative">
            <Smartphone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-600" />
            <span className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 border-r border-brand-200 pr-3 text-sm font-semibold text-brand-900">
              +91
            </span>
            <input
              id="mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="username"
              placeholder="10 digit mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={`${inputCls} pl-[6.25rem]`}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-brand-900">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-600" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputCls} pl-12 pr-12`}
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
              Log in <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </>
          )}
        </button>

        <div className="relative py-1 text-center">
          <span className="absolute inset-x-0 top-1/2 border-t border-brand-100" />
          <span className="relative bg-white px-3 text-xs text-slate-400">New to {SITE.brand}?</span>
        </div>

        <Link
          href="/student/register"
          className="flex w-full items-center justify-center rounded-xl border-2 border-gold-400 px-5 py-3 text-sm font-bold text-brand-900 transition hover:bg-gold-100/60 active:scale-[0.98]"
        >
          Create an account
        </Link>

        <Link
          href="/"
          className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-brand-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to website
        </Link>
      </form>
    </AuthShell>
  );
}