"use client";

import { useState } from "react";
import { AlertCircle, Check, Copy, Loader2, Mail, Search, Smartphone, ClipboardCheck } from "lucide-react";

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

// Normal flow ke 4 padav; MORE_INFO "Under review" par rukta hai
const FLOW = ["Submitted", "Under review", "Approved", "Active"];
const FLOW_INDEX: Record<string, number> = { SUBMITTED: 0, UNDER_REVIEW: 1, MORE_INFO: 1, APPROVED: 2, ACTIVE: 3 };

const BADGE: Record<string, string> = {
  SUBMITTED: "bg-brand-50 text-brand-800",
  UNDER_REVIEW: "bg-brand-50 text-brand-800",
  MORE_INFO: "bg-amber-100 text-amber-900",
  APPROVED: "bg-gold-100 text-brand-900",
  REJECTED: "bg-red-100 text-red-700",
  ACTIVE: "bg-emerald-100 text-emerald-800",
};

export default function ApplicationStatusCheck() {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard na mile to chupchap ignore
    }
  }

  const inputCls =
    "w-full rounded-xl border border-brand-100 bg-brand-50/60 py-3.5 pl-12 pr-4 text-sm text-brand-900 outline-none transition placeholder:text-slate-400 focus:border-gold-400 focus:bg-white focus:ring-4 focus:ring-gold-400/20";
  const iconCls = "pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-600";

  const step = result ? FLOW_INDEX[result.status] : undefined;

  return (
    <aside className="relative overflow-hidden rounded-3xl border border-white bg-white p-6 shadow-2xl shadow-brand-900/10 sm:p-7">
      <ClipboardCheck className="pointer-events-none absolute -bottom-6 -right-6 h-32 w-32 text-brand-50" />

      <div className="relative flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-400 text-brand-900">
          <Search className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-lg font-black text-brand-900">Application status</h2>
          <p className="text-xs text-slate-500">Already applied? Check where it stands.</p>
        </div>
      </div>

      <form onSubmit={check} className="relative mt-5 space-y-3">
        <div className="relative">
          <Mail className={iconCls} />
          <input
            className={inputCls}
            type="email"
            autoComplete="email"
            placeholder="Email you applied with"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="relative">
          <Smartphone className={iconCls} />
          <input
            className={inputCls}
            placeholder="Mobile (10 digits)"
            inputMode="numeric"
            autoComplete="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
            required
          />
        </div>
        <button
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-900/20 transition hover:bg-brand-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Checking...
            </>
          ) : (
            "Check status"
          )}
        </button>
      </form>

      {error && (
        <div role="alert" className="relative mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="relative mt-5 space-y-4 border-t border-brand-100 pt-5 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-black text-brand-900">{result.name}</p>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${BADGE[result.status] ?? "bg-brand-50 text-brand-800"}`}>
              {LABEL[result.status] ?? result.status}
            </span>
          </div>

          {/* Progress */}
          {step !== undefined && (
            <ol className="flex items-start">
              {FLOW.map((label, i) => {
                const reached = i <= step;
                return (
                  <li key={label} className="relative flex flex-1 flex-col items-center text-center">
                    {i > 0 && (
                      <span
                        aria-hidden
                        className={`absolute right-1/2 top-3 h-0.5 w-full ${i <= step ? "bg-brand-900" : "bg-brand-100"}`}
                      />
                    )}
                    <span
                      className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-black ${
                        reached ? "border-brand-900 bg-brand-900 text-gold-400" : "border-brand-200 bg-white text-slate-300"
                      }`}
                    >
                      {reached ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                    </span>
                    <span className={`mt-1.5 text-[11px] font-semibold leading-tight ${reached ? "text-brand-900" : "text-slate-400"}`}>
                      {label}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          {result.note && <p className="rounded-xl bg-amber-50 p-3 text-amber-900">{result.note}</p>}

          {!result.feePaid && result.status !== "REJECTED" && result.status !== "ACTIVE" && (
            <p className="rounded-xl bg-brand-50 p-3 text-slate-600">
              The ₹2,999 registration &amp; training fee is pending. Your account activates once you are approved
              and the fee is confirmed.
            </p>
          )}

          {result.status === "ACTIVE" && (
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-900">
              <p>Your account is active. Log in from the home page using the Partner role.</p>
              {result.referralCode && (
                <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Referral code</p>
                    <p className="font-mono text-base font-black tracking-wider text-brand-900">{result.referralCode}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyCode(result.referralCode as string)}
                    className="flex items-center gap-1.5 rounded-full bg-brand-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand-800 active:scale-95"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-gold-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}