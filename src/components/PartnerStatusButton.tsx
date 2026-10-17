"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PartnerStatusButton({ id, isActive }: { id: number; isActive: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={
        isActive
          ? "rounded border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
          : "rounded border bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200 disabled:opacity-50"
      }
    >
      {isActive ? "Suspend" : "Reactivate"}
    </button>
  );
}