"use client";

import { useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Check,
  ChevronDown,
  CircleCheck,
  Eye,
  EyeOff,
  Gift,
  Handshake,
  IdCard,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Smartphone,
  User,
} from "lucide-react";

type District = { id: number; name: string };

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
  className = "",
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-center justify-between text-sm font-bold text-brand-900">
        {label}
        {optional && <span className="text-xs font-medium text-slate-400">Optional</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function Group({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-400 text-xs font-black text-brand-900">
          {n}
        </span>
        <h3 className="text-sm font-black uppercase tracking-widest text-brand-900">{title}</h3>
        <span className="h-px flex-1 bg-brand-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export default function PartnerApplyForm({ districts }: { districts: District[] }) {
  const params = useSearchParams();
  const [f, setF] = useState({
    name: "",
    email: "",
    mobile: "",
    districtId: "",
    referralCode: (params.get("ref") ?? "").toUpperCase(),
    password: "",
    confirm: "",
    pan: "",
    experience: "",
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (f.password !== f.confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/partner-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.name,
          email: f.email,
          mobile: f.mobile,
          password: f.password,
          districtId: f.districtId ? Number(f.districtId) : undefined,
          referralCode: f.referralCode || undefined,
          pan: f.pan,
          experience: f.experience,
          terms: f.terms,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-white bg-white p-8 text-center shadow-2xl shadow-brand-900/10 sm:p-12">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold-400 text-brand-900 ring-8 ring-gold-100">
          <CircleCheck className="h-10 w-10" />
        </span>
        <h2 className="mt-6 text-3xl font-black text-brand-900">Application submitted</h2>
        <p className="mx-auto mt-3 max-w-md text-slate-600">
          We will review it shortly. Use the status box on this page with your email and mobile to follow your
          application.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-brand-100 bg-brand-50/60 py-3.5 pl-12 pr-4 text-sm text-brand-900 outline-none transition placeholder:text-slate-400 focus:border-gold-400 focus:bg-white focus:ring-4 focus:ring-gold-400/20";
  const iconCls = "pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-600";

  const level = f.password ? strengthOf(f.password) : 0;
  const matches = f.confirm.length > 0 && f.password === f.confirm;
  const mismatch = f.confirm.length > 0 && f.password !== f.confirm;

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-8 rounded-3xl border border-white bg-white p-6 shadow-2xl shadow-brand-900/10 sm:p-9"
    >
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-900 text-gold-400 shadow-lg shadow-brand-900/20">
          <Handshake className="h-7 w-7" />
        </span>
        <div>
          <h2 className="text-2xl font-black text-brand-900">Partner application</h2>
          <p className="text-sm text-slate-500">Fill in your details. It takes a few minutes.</p>
        </div>
      </div>

      <Group n={1} title="Your details">
        <Field id="name" label="Full name">
          <div className="relative">
            <User className={iconCls} />
            <input id="name" autoComplete="name" placeholder="Your full name" value={f.name} onChange={(e) => set("name", e.target.value)} className={inputCls} required />
          </div>
        </Field>

        <Field id="email" label="Email">
          <div className="relative">
            <Mail className={iconCls} />
            <input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={f.email} onChange={(e) => set("email", e.target.value)} className={inputCls} required />
          </div>
        </Field>

        <Field id="mobile" label="Mobile number">
          <div className="relative">
            <Smartphone className={iconCls} />
            <span className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 border-r border-brand-200 pr-3 text-sm font-semibold text-brand-900">
              +91
            </span>
            <input
              id="mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="10 digit mobile number"
              value={f.mobile}
              onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={`${inputCls} pl-[6.25rem]`}
              required
            />
          </div>
        </Field>

        <Field id="district" label="District" hint="The district you will work in">
          <div className="relative">
            <MapPin className={iconCls} />
            <select
              id="district"
              value={f.districtId}
              onChange={(e) => set("districtId", e.target.value)}
              className={`${inputCls} appearance-none pr-10 ${f.districtId ? "" : "text-slate-400"}`}
            >
              <option value="">Select district</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </Field>

        <Field id="pan" label="PAN">
          <div className="relative">
            <IdCard className={iconCls} />
            <input
              id="pan"
              placeholder="ABCDE1234F"
              value={f.pan}
              onChange={(e) => set("pan", e.target.value.toUpperCase().slice(0, 10))}
              className={`${inputCls} font-mono tracking-wider`}
              required
            />
          </div>
        </Field>

        <Field id="referral" label="Referral code" optional hint="The partner who introduced you">
          <div className="relative">
            <Gift className={iconCls} />
            <input
              id="referral"
              placeholder="e.g. ABC123"
              value={f.referralCode}
              onChange={(e) => set("referralCode", e.target.value.toUpperCase())}
              className={`${inputCls} font-mono tracking-wider`}
            />
          </div>
        </Field>
      </Group>

      <Group n={2} title="Account security">
        <Field id="password" label="Password">
          <div className="relative">
            <Lock className={iconCls} />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min 8 characters"
              value={f.password}
              onChange={(e) => set("password", e.target.value)}
              className={`${inputCls} pr-12`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide passwords" : "Show passwords"}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-brand-50 hover:text-brand-900"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
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
              value={f.confirm}
              onChange={(e) => set("confirm", e.target.value)}
              className={`${inputCls} ${mismatch ? "border-red-300 focus:border-red-400 focus:ring-red-200" : ""}`}
              required
            />
          </div>
        </Field>

        {f.password && (
          <div className="space-y-2 sm:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex flex-1 gap-1.5">
                {[1, 2, 3].map((n) => (
                  <span key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${level >= n ? STRENGTH_COLOR[level] : "bg-slate-200"}`} />
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
      </Group>

      <Group n={3} title="About you">
        <Field id="experience" label="Your experience" className="sm:col-span-2" hint="Tell us about your work, centre or network.">
          <div className="relative">
            <Briefcase className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-brand-600" />
            <textarea
              id="experience"
              rows={4}
              placeholder="e.g. I run a tuition centre for Class 11–12 commerce in Rajpura."
              value={f.experience}
              onChange={(e) => set("experience", e.target.value)}
              className={`${inputCls} resize-y py-3.5`}
              required
            />
          </div>
        </Field>
      </Group>

      {/* Terms */}
      <label
        className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 text-sm transition ${
          f.terms ? "border-gold-400 bg-gold-100/50" : "border-brand-100 bg-brand-50/40 hover:border-brand-300"
        }`}
      >
        <input type="checkbox" checked={f.terms} onChange={(e) => set("terms", e.target.checked)} className="peer sr-only" />
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-gold-400 ${
            f.terms ? "border-brand-900 bg-brand-900 text-gold-400" : "border-brand-300 bg-white"
          }`}
        >
          {f.terms && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </span>
        <span className="text-brand-900">
          I agree to the Partner Agreement and the <b>₹2,999</b> registration &amp; training fee.
        </span>
      </label>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        disabled={loading}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-brand-900/20 transition hover:bg-brand-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Please wait...
          </>
        ) : (
          <>
            <BadgeCheck className="h-4 w-4 text-gold-400" /> Submit application
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}