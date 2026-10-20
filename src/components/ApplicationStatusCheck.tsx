"use client";

import { useState } from "react";

type Result = {
  name: string;
  status: string;
  note: string | null;
  feePaid: boolean;
  referralCode: string | null;
};

const LABEL: Record<string, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  MORE_INFO: "More information needed",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  ACTIVE: "Active",
};

export default function ApplicationStatusCheck() {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/partner-apply/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mobile }),
      });
      let data: (Result & { error?: string }) | null = null;
      try {
        data = await res.json();
      } catch {
        // The response was not JSON.
      }
      if (!res.ok || !data) {
        setError(data?.error ?? "Something went wrong");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="space-y-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Application status</h2>
      <form onSubmit={check} className="space-y-2">
        <input
          className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
          type="email"
          placeholder="Email you applied with"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
          placeholder="Mobile (10 digits)"
          inputMode="numeric"
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
          required
        />
        <button
          disabled={loading}
          className="w-full rounded-lg bg-brand-700 p-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </form>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {result && (
        <div className="space-y-2 text-sm">
          <p>
            <b>{result.name}</b> · {LABEL[result.status] ?? result.status}
          </p>
          {result.note && <p className="rounded bg-amber-50 p-2 text-amber-900">{result.note}</p>}
          {!result.feePaid && result.status !== "REJECTED" && result.status !== "ACTIVE" && (
            <p className="text-gray-600">
              The ₹2,999 registration &amp; training fee is pending. Your account activates once you are
              approved and the fee is confirmed.
            </p>
          )}
          {result.status === "ACTIVE" && (
            <p className="rounded bg-emerald-50 p-2 text-emerald-900">
              Your account is active. Referral code: <b className="font-mono">{result.referralCode}</b>.
              Log in from the home page using the Partner role.
            </p>
          )}
        </div>
      )}
    </aside>
  );
}