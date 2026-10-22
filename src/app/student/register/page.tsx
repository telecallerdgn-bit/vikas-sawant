"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function RegisterForm() {
  const params = useSearchParams();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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

  const input = "w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-400";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 p-4 font-[family-name:var(--font-lato)]">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3 rounded-2xl border border-white bg-white p-7 shadow-lg">
        <div className="pb-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Student</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Create your account</h1>
        </div>

        <input className={input} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input
          className={input}
          type="tel"
          inputMode="numeric"
          autoComplete="username"
          placeholder="Mobile number (10 digits)"
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
          required
        />
        <input className={input} type="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          className={input}
          type="password"
          autoComplete="new-password"
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          className={input}
          type="password"
          autoComplete="new-password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <div>
          <input
            className={`${input} font-mono`}
            placeholder="Referral code (optional)"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
          />
          <p className="mt-1 text-xs text-slate-500">The partner who told you about us</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 p-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Please wait..." : "Create account"}
        </button>

        <p className="text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link href="/student/login" className="font-medium text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}

export default function StudentRegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}