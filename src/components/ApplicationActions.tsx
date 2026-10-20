"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { id: number; status: string; feePaid: boolean };

export default function ApplicationActions({ id, status, feePaid }: Props) {
  const router = useRouter();
  const [ask, setAsk] = useState<null | "more_info" | "reject">(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(action: string, noteText?: string) {
    setError("");
    setLoading(true);
    const res = await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note: noteText }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? "Something went wrong");
      return;
    }
    setAsk(null);
    setNote("");
    router.refresh();
  }

  const open = ["SUBMITTED", "UNDER_REVIEW", "MORE_INFO"].includes(status);
  const canMarkFee = !feePaid && status !== "REJECTED" && status !== "ACTIVE";
  const btn = "rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50";

  return (
    <div className="min-w-[13rem] space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {status === "SUBMITTED" && (
          <button disabled={loading} onClick={() => send("review")} className={`${btn} bg-blue-600 text-white hover:bg-blue-700`}>
            Start review
          </button>
        )}
        {open && (
          <button disabled={loading} onClick={() => send("approve")} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}>
            Approve
          </button>
        )}
        {(status === "SUBMITTED" || status === "UNDER_REVIEW") && (
          <button
            disabled={loading}
            onClick={() => setAsk("more_info")}
            className={`${btn} border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100`}
          >
            Ask for info
          </button>
        )}
        {canMarkFee && (
          <button
            disabled={loading}
            onClick={() => {
              if (confirm("Confirm that the ₹2,999 fee has been received?")) send("mark_fee_paid");
            }}
            className={`${btn} border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}
          >
            Mark fee paid
          </button>
        )}
        {(open || status === "APPROVED") && (
          <button
            disabled={loading}
            onClick={() => setAsk("reject")}
            className={`${btn} border border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
          >
            Reject
          </button>
        )}
      </div>

      {status === "APPROVED" && !feePaid && <p className="text-xs text-slate-500">Waiting for fee payment</p>}
      {(status === "ACTIVE" || status === "REJECTED") && <p className="text-xs text-slate-400">Closed</p>}

      {ask && (
        <div className="space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Message to applicant"
            className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-blue-400"
            rows={2}
          />
          <div className="flex gap-2">
            <button disabled={loading} onClick={() => send(ask, note)} className={`${btn} bg-slate-900 text-white hover:bg-slate-800`}>
              Send
            </button>
            <button onClick={() => setAsk(null)} className={`${btn} border border-slate-200`}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}