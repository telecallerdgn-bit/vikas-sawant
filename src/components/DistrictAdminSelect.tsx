"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Admin = { id: number; name: string; email: string };

export default function DistrictAdminSelect({
  districtId,
  currentAdminId,
  admins,
}: {
  districtId: number;
  currentAdminId: number | null;
  admins: Admin[];
}) {
  const router = useRouter();
  const initial = currentAdminId ? String(currentAdminId) : "";
  const [value, setValue] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dirty = value !== initial;

  async function save() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/districts/${districtId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: value ? Number(value) : null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Could not save");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <select
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          disabled={loading}
          aria-label="District admin"
          className={`h-9 w-56 rounded-lg border bg-white px-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 disabled:opacity-60 ${
            value ? "border-slate-200 text-slate-900" : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          <option value="">Unassigned</option>
          {admins.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} · {a.email}
            </option>
          ))}
        </select>

        {dirty && (
          <button
            onClick={save}
            disabled={loading}
            className="h-9 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Saving…" : "Save"}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}