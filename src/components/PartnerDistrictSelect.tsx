"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type District = { id: number; name: string };

export default function PartnerDistrictSelect({
  partnerId,
  partnerName,
  currentId,
  districts,
}: {
  partnerId: number;
  partnerName: string;
  currentId: number | null;
  districts: District[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(currentId === null ? "" : String(currentId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function change(next: string) {
    if (next === value) return;
    setError("");

    const from = districts.find((d) => String(d.id) === value)?.name;
    const to = districts.find((d) => String(d.id) === next)?.name;

    // Sales are counted by the partner's district, so moving a partner moves their sales too.
    if (from) {
      const message = to
        ? `Move ${partnerName} from ${from} to ${to}? Their sales, including past sales, will count towards ${to} from now on.`
        : `Remove ${partnerName} from ${from}? Their sales will no longer count towards any district.`;
      if (!window.confirm(message)) return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/partners/${partnerId}/district`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ districtId: next === "" ? null : Number(next) }),
      });
      if (!res.ok) {
        let message = "Could not save";
        try {
          const data = await res.json();
          message = data.error ?? message;
        } catch {
          // The response was not JSON.
        }
        setError(message);
        return;
      }
      setValue(next);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <select
        value={value}
        disabled={saving}
        onChange={(e) => change(e.target.value)}
        aria-label={`District for ${partnerName}`}
        className="w-44 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">No district</option>
        {districts.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}