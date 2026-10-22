"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { id: number; status: string; amount: string; name: string };

export default function PayoutActions({ id, status, amount, name }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<null | "reject" | "paid">(null);
  const [note, setNote] = useState("");
  const [utr, setUtr] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(body: Record<string, unknown>) {
    setError("");
    setLoading(true);
    const res = await fetch(`/api/finance/payouts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }
    setMode(null);
    setNote("");
    setUtr("");
    router.refresh();
  }

  const btn = "rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50";

  if (status === "PAID" || status === "REJECTED") {
    return <span className="text-xs text-slate-400">Closed</span>;
  }

  return (
    <div className="min-w-[13rem] space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {status === "REQUESTED" && (
          <button disabled={loading} onClick={() => send({ action: "approve" })} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}>
            Approve
          </button>
        )}
        {status === "APPROVED" && (
          <button disabled={loading} onClick={() => setMode("paid")} className={`${btn} bg-blue-600 text-white hover:bg-blue-700`}>
            Mark paid
          </button>
        )}
        <button
          disabled={loading}
          onClick={() => setMode("reject")}
          className={`${btn} border border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
        >
          Reject
        </button>
      </div>

      {mode === "reject" && (
        <div className="space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason shown to the partner"
            rows={2}
            className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-blue-400"
          />
          <div className="flex gap-2">
            <button disabled={loading} onClick={() => send({ action: "reject", note })} className={`${btn} bg-slate-900 text-white`}>
              Reject payout
            </button>
            <button onClick={() => setMode(null)} className={`${btn} border border-slate-200`}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {mode === "paid" && (
        <div className="space-y-2">
          <input
            value={utr}
            onChange={(e) => setUtr(e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase())}
            placeholder="Bank reference (UTR)"
            className="w-full rounded-lg border border-slate-200 p-2 font-mono text-sm outline-none focus:border-blue-400"
          />
          <div className="flex gap-2">
            <button
              disabled={loading || utr.length < 8}
              onClick={() => {
                if (confirm(`Confirm that ${amount} was sent to ${name}?`)) send({ action: "mark_paid", utr });
              }}
              className={`${btn} bg-slate-900 text-white`}
            >
              Confirm paid
            </button>
            <button onClick={() => setMode(null)} className={`${btn} border border-slate-200`}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}