"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { COURIERS } from "@/lib/shipment";

const NEXT_LABEL: Record<string, string> = {
  LABEL_GENERATED: "Mark picked up",
  DISPATCHED: "Mark in transit",
  IN_TRANSIT: "Out for delivery",
  OUT_FOR_DELIVERY: "Mark delivered",
};

const base =
  "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1";
const primary = `${base} bg-blue-600 text-white hover:bg-blue-700`;
const secondary = `${base} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`;
const danger = `${base} border border-red-200 bg-white text-red-700 hover:bg-red-50`;
const field =
  "rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15";

export default function ShipmentActions({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  const [weight, setWeight] = useState("");
  const [courier, setCourier] = useState<string>(COURIERS[0]);
  const [awb, setAwb] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(body: Record<string, unknown>) {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/packing/shipments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        let message = "Something went wrong";
        try {
          const data = await res.json();
          message = data.error ?? message;
        } catch {
          // The response was not JSON, keep the default message.
        }
        setError(message);
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-w-[220px] space-y-2">
      {status === "AWAITING_PACKING" && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            className={`${field} w-28`}
            inputMode="numeric"
            placeholder="Weight (g)"
            aria-label="Parcel weight in grams"
            value={weight}
            onChange={(e) => setWeight(e.target.value.replace(/\D/g, ""))}
          />
          <button
            disabled={loading || !weight || Number(weight) < 1}
            onClick={() => send({ action: "pack", weightGrams: Number(weight) })}
            className={primary}
          >
            Mark packed
          </button>
        </div>
      )}

      {status === "PACKED" && (
        <div className="flex flex-wrap items-center gap-2">
          <select
            className={field}
            value={courier}
            onChange={(e) => setCourier(e.target.value)}
            aria-label="Courier"
          >
            {COURIERS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input
            className={`${field} w-36 font-mono`}
            placeholder="AWB number"
            aria-label="AWB number"
            value={awb}
            onChange={(e) => setAwb(e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase())}
          />
          <button
            disabled={loading || awb.length < 6}
            onClick={() => send({ action: "create", courier, awb })}
            className={primary}
          >
            Create shipment
          </button>
        </div>
      )}

      {NEXT_LABEL[status] && (
        <div className="flex flex-wrap gap-2">
          <button disabled={loading} onClick={() => send({ action: "advance" })} className={primary}>
            {NEXT_LABEL[status]}
          </button>
          {status === "OUT_FOR_DELIVERY" && (
            <button disabled={loading} onClick={() => send({ action: "fail" })} className={danger}>
              Delivery failed
            </button>
          )}
        </div>
      )}

      {status === "DELIVERY_FAILED" && (
        <div className="flex flex-wrap gap-2">
          <button disabled={loading} onClick={() => send({ action: "retry" })} className={secondary}>
            Retry delivery
          </button>
          <button disabled={loading} onClick={() => send({ action: "return" })} className={danger}>
            Return to origin
          </button>
        </div>
      )}

      {(status === "DELIVERED" || status === "RETURNED") && (
        <span className="text-xs text-slate-400">Closed</span>
      )}

      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}