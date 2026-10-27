"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OrderActions({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function set(status: "PAID" | "FAILED") {
    const ok =
      status === "PAID"
        ? confirm(`Mark order #${orderId} as paid? Do this only after you have received the payment.`)
        : confirm(`Mark order #${orderId} as failed?`);
    if (!ok) return;

    setError("");
    setBusy(true);
    try {
      const res = await fetch(`/api/student-admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        let data: { error?: string } | null = null;
        try {
          data = await res.json();
        } catch {
          // The response was not JSON.
        }
        setError(data?.error ?? "Could not update");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => set("PAID")}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Mark paid
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => set("FAILED")}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Failed
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}