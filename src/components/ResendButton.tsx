"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResendButton({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function resend() {
    setError("");
    setLoading(true);
    const res = await fetch(`/api/admin/notifications/${id}`, { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Could not resend");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={resend}
        disabled={loading}
        className="rounded border px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
      >
        {loading ? "Sending..." : "Resend"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}