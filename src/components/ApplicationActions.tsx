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
  const btn = "rounded px-3 py-1 text-sm disabled:opacity-50";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {status === "SUBMITTED" && (
          <button disabled={loading} onClick={() => send("review")} className={`${btn} border bg-gray-100`}>
            Start review
          </button>
        )}
        {open && (
          <button disabled={loading} onClick={() => send("approve")} className={`${btn} bg-emerald-800 text-white`}>
            Approve
          </button>
        )}
        {(status === "SUBMITTED" || status === "UNDER_REVIEW") && (
          <button disabled={loading} onClick={() => setAsk("more_info")} className={`${btn} border bg-gray-100`}>
            Ask for info
          </button>
        )}
        {(open || status === "APPROVED") && (
          <button
            disabled={loading}
            onClick={() => setAsk("reject")}
            className={`${btn} border border-red-300 text-red-700`}
          >
            Reject
          </button>
        )}
        {canMarkFee && (
          <button
            disabled={loading}
            onClick={() => {
              if (confirm("Confirm that the ₹2,999 fee has been received?")) send("mark_fee_paid");
            }}
            className={`${btn} border border-emerald-700 text-emerald-800`}
          >
            Mark fee paid
          </button>
        )}
      </div>

      {status === "APPROVED" && !feePaid && (
        <p className="text-xs text-gray-500">Waiting for fee payment</p>
      )}

      {ask && (
        <div className="space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Message to applicant"
            className="w-full rounded border p-2 text-sm"
            rows={2}
          />
          <div className="flex gap-2">
            <button disabled={loading} onClick={() => send(ask, note)} className={`${btn} bg-black text-white`}>
              Send
            </button>
            <button onClick={() => setAsk(null)} className={`${btn} border`}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}