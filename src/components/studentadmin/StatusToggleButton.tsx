"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StatusToggleButton({
  url,
  active,
  activateLabel = "Activate",
  deactivateLabel = "Deactivate",
  confirmDeactivate,
}: {
  url: string;
  active: boolean;
  activateLabel?: string;
  deactivateLabel?: string;
  confirmDeactivate?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    if (active && confirmDeactivate && !confirm(confirmDeactivate)) return;
    setError("");
    setLoading(true);
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", isActive: !active }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not update");
      return;
    }
    router.refresh();
  }

  return (
    <div className="inline-block">
      <button
        onClick={toggle}
        disabled={loading}
        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
          active
            ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        }`}
      >
        {active ? deactivateLabel : activateLabel}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}