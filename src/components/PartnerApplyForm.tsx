"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

type District = { id: number; name: string };

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
      <div className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Application submitted</h2>
        <p className="mt-2 text-sm text-gray-600">
          We will review it shortly. Use the status box on this page with your email and mobile to
          follow your application.
        </p>
      </div>
    );
  }

  const input = "w-full rounded border p-2 text-sm";

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border bg-white p-6 sm:grid-cols-2">
      <input className={input} placeholder="Full name" value={f.name} onChange={(e) => set("name", e.target.value)} required />
      <input className={input} type="email" placeholder="Email" value={f.email} onChange={(e) => set("email", e.target.value)} required />
      <input
        className={input}
        placeholder="Mobile (10 digits)"
        value={f.mobile}
        onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
        required
      />
      <select className={`${input} bg-white`} value={f.districtId} onChange={(e) => set("districtId", e.target.value)}>
        <option value="">District you will work in</option>
        {districts.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      <div>
        <input
          className={`${input} font-mono`}
          placeholder="Referral code (optional)"
          value={f.referralCode}
          onChange={(e) => set("referralCode", e.target.value.toUpperCase())}
        />
        <p className="mt-1 text-xs text-gray-500">The partner who introduced you</p>
      </div>
      <input
        className={`${input} font-mono`}
        placeholder="PAN (ABCDE1234F)"
        value={f.pan}
        onChange={(e) => set("pan", e.target.value.toUpperCase().slice(0, 10))}
        required
      />

      <input className={input} type="password" placeholder="Password (min 8 characters)" value={f.password} onChange={(e) => set("password", e.target.value)} required />
      <input className={input} type="password" placeholder="Confirm password" value={f.confirm} onChange={(e) => set("confirm", e.target.value)} required />

      <textarea
        className={`${input} sm:col-span-2`}
        rows={3}
        placeholder="Your experience, e.g. I run a tuition centre for Class 11–12 commerce in Rajpura."
        value={f.experience}
        onChange={(e) => set("experience", e.target.value)}
        required
      />

      <label className="flex items-start gap-2 text-sm sm:col-span-2">
        <input type="checkbox" checked={f.terms} onChange={(e) => set("terms", e.target.checked)} className="mt-1" />
        <span>I agree to the Partner Agreement and the ₹2,999 registration &amp; training fee.</span>
      </label>

      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}

      <button disabled={loading} className="rounded bg-emerald-700 p-2 text-sm font-medium text-white disabled:opacity-50 sm:col-span-2">
        {loading ? "Please wait..." : "Submit application"}
      </button>
    </form>
  );
}