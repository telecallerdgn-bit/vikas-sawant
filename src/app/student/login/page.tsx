"use client";

import Link from "next/link";
import { useState } from "react";

export default function StudentLoginPage() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 p-4 font-[family-name:var(--font-lato)]">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-2xl border border-white bg-white p-7 shadow-lg">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Student</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Log in with your mobile number.</p>
        </div>

        <input
          type="tel"
          inputMode="numeric"
          autoComplete="username"
          placeholder="Mobile number (10 digits)"
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
          className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-400"
          required
        />
        <input
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-400"
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 p-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Please wait..." : "Log in"}
        </button>

        <p className="text-center text-sm text-slate-600">
          New here?{" "}
          <Link href="/student/register" className="font-medium text-blue-600 hover:underline">
            Create an account
          </Link>
        </p>
        <Link href="/" className="block text-center text-xs text-slate-400 hover:text-slate-600">
          Back to website
        </Link>
      </form>
    </main>
  );
}