"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import type { ModeOption } from "@/lib/pricing";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const field =
  "w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none focus:border-[#f8b915]";
const label = "mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500";

export default function EnrollForm({
  courseId,
  options,
  address,
}: {
  courseId: number;
  options: ModeOption[];
  address: { addressLine: string; city: string; pincode: string };
}) {
  const router = useRouter();
  const uid = useId();
  const [mode, setMode] = useState(options[0]?.mode ?? "");
  const [addr, setAddr] = useState(address);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selected = options.find((o) => o.mode === mode);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!selected) return setError("Choose a mode");

    setLoading(true);
    try {
      const res = await fetch("/api/student/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, mode, ...(selected.needsAddress ? addr : {}) }),
      });
      let data: { error?: string } | null = null;
      try {
        data = await res.json();
      } catch {
        // The response was not JSON.
      }
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong");
        return;
      }
      router.refresh(); // the page now shows the pending order
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <fieldset>
        <legend className={label}>Choose your mode</legend>
        <div className="mt-2 space-y-2">
          {options.map((o) => {
            const on = mode === o.mode;
            return (
              <label
                key={o.mode}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition ${
                  on ? "border-[#f8b915] bg-amber-50" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name={`${uid}-mode`}
                  checked={on}
                  onChange={() => setMode(o.mode)}
                  className="h-4 w-4"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[#0b2149]">{o.label}</span>
                  <span className="block text-xs text-slate-500">{o.hint}</span>
                </span>
                <span className="text-right">
                  {o.original !== null && (
                    <span className="block text-xs text-slate-400 line-through">{money.format(o.original)}</span>
                  )}
                  <span className="block text-base font-black text-[#0b2149]">{money.format(o.price)}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {selected?.needsAddress && (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-[#0b2149]">Delivery address for your books</p>
          <div>
            <label htmlFor={`${uid}-a`} className={label}>Address</label>
            <input
              id={`${uid}-a`}
              className={field}
              maxLength={200}
              value={addr.addressLine}
              onChange={(e) => setAddr({ ...addr, addressLine: e.target.value })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor={`${uid}-c`} className={label}>City</label>
              <input
                id={`${uid}-c`}
                className={field}
                maxLength={80}
                value={addr.city}
                onChange={(e) => setAddr({ ...addr, city: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor={`${uid}-p`} className={label}>Pincode</label>
              <input
                id={`${uid}-p`}
                inputMode="numeric"
                className={field}
                maxLength={6}
                value={addr.pincode}
                onChange={(e) => setAddr({ ...addr, pincode: e.target.value.replace(/\D/g, "") })}
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        disabled={loading}
        className="w-full rounded-full bg-[#f8b915] py-3 text-sm font-bold text-[#0b2149] hover:bg-[#e3a600] disabled:opacity-50"
      >
        {loading ? "Please wait..." : selected ? `Enroll for ${money.format(selected.price)}` : "Enroll"}
      </button>
      <p className="text-center text-xs text-slate-500">
        No payment is taken here. Our team will confirm your payment and open the course.
      </p>
    </form>
  );
}