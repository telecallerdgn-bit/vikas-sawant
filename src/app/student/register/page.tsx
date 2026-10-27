"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Eye,
  EyeOff,
  Gift,
  GraduationCap,
  ListChecks,
  Loader2,
  Lock,
  Mail,
  Smartphone,
  User,
  UserPlus,
} from "lucide-react";
import AuthShell, { type AuthPerk } from "@/components/site/AuthShell";

const PERKS: AuthPerk[] = [
  { icon: UserPlus, title: "Create your account", text: "Register with your mobile number. It takes a minute." },
  { icon: ListChecks, title: "Choose course and mode", text: "Pick what suits your time and budget." },
  { icon: BookOpen, title: "Start learning", text: "Books are delivered to your address." },
];

function strengthOf(p: string) {
  let level = 0;
  if (p.length >= 8) level++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) level++;
  if (/\d/.test(p) || /[^A-Za-z0-9]/.test(p)) level++;
  return level;
}

const STRENGTH_LABEL = ["Min 8 characters", "Weak", "Okay", "Strong"];
const STRENGTH_COLOR = ["bg-slate-200", "bg-red-400", "bg-gold-400", "bg-emerald-500"];

function Field({
  id,
  label,
  optional,
  hint,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-center justify-between text-sm font-bold text-brand-900">
        {label}
        {optional && <span className="text-xs font-medium text-slate-400">Optional</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function RegisterForm() {
  const params = useSearchParams();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState((params.get("ref") ?? "").toUpperCase());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/student/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          mobile,
          email: email || undefined,
          password,
          referralCode: referralCode || undefined,
        }),
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
  const iconCls = "pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-600";

  const level = password ? strengthOf(password) : 0;
  const matches = confirm.length > 0 && password === confirm;
  const mismatch = confirm.length > 0 && password !== confirm;

  const eye = (
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      aria-label={showPassword ? "Hide passwords" : "Show passwords"}
      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-brand-50 hover:text-brand-900"
    >
      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
    </button>
  );

  return (
    <AuthShell
      wide
      badge="New student"
      title={
        <>
          Create your account,
          <br />
          <span className="italic text-gold-400">start learning today</span>
        </>
      }
      text="Join in a minute and get access to live classes, recorded lessons and study material."
      perks={PERKS}
    >
      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-3xl border border-white bg-white p-7 shadow-2xl shadow-brand-900/10 sm:p-9"
      >
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3.5 py-1 text-xs font-semibold text-brand-800">
            <GraduationCap className="h-3.5 w-3.5" /> Student registration
          </span>
          <h2 className="mt-4 text-3xl font-black text-brand-900">Create your account</h2>
          <p className="mt-1.5 text-sm text-slate-500">It only takes a minute.</p>
        </div>

        <Field id="name" label="Full name">
          <div className="relative">
            <User className={iconCls} />
            <input
              id="name"
              autoComplete="name"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputCls} pl-12`}
              required
            />
          </div>
        </Field>

        <Field id="mobile" label="Mobile number" hint="You will use this number to log in.">
          <div className="relative">
            <Smartphone className={iconCls} />
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
        </Field>

        <Field id="email" label="Email" optional>
          <div className="relative">
            <Mail className={iconCls} />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputCls} pl-12`}
            />
          </div>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="password" label="Password">
            <div className="relative">
              <Lock className={iconCls} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputCls} pl-12 pr-12`}
                required
              />
              {eye}
            </div>
          </Field>

          <Field id="confirm" label="Confirm password">
            <div className="relative">
              <Lock className={iconCls} />
              <input
                id="confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`${inputCls} pl-12 ${mismatch ? "border-red-300 focus:border-red-400 focus:ring-red-200" : ""}`}
                required
              />
            </div>
          </Field>
        </div>

        {/* Password strength + match */}
        {password && (
          <div className="-mt-2 space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex flex-1 gap-1.5">
                {[1, 2, 3].map((n) => (
                  <span
                    key={n}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${level >= n ? STRENGTH_COLOR[level] : "bg-slate-200"}`}
                  />
                ))}
              </div>
              <span className="w-28 text-right text-xs font-semibold text-slate-500">{STRENGTH_LABEL[level]}</span>
            </div>
            {matches && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <Check className="h-3.5 w-3.5" /> Passwords match
              </p>
            )}
            {mismatch && <p className="text-xs font-semibold text-red-600">Passwords do not match yet</p>}
          </div>
        )}

        <Field id="referral" label="Referral code" optional hint="The partner who told you about us">
          <div className="relative">
            <Gift className={iconCls} />
            <input
              id="referral"
              placeholder="e.g. ABC123"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              className={`${inputCls} pl-12 font-mono tracking-wider`}
            />
          </div>
        </Field>

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
              Create account <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link href="/student/login" className="font-bold text-brand-900 underline decoration-gold-400 decoration-2 underline-offset-4 hover:text-brand-700">
            Log in
          </Link>
        </p>

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

export default function StudentRegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}