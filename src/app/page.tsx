"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const roles = [
  { label: "Admin", value: "admin" },
  { label: "Partner", value: "partner" },
  { label: "District Admin", value: "district" },
  { label: "Sub Super", value: "sub-super" },
  { label: "Finance", value: "finance" },
  { label: "Packing", value: "packing" },
];

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState("");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm space-y-5 rounded-xl border bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Management Portal
          </p>
          <h1 className="mt-1 text-2xl font-semibold">ABC Academy</h1>
          <p className="mt-1 text-sm text-gray-600">Select your role to continue</p>
        </div>

        <div className="space-y-3">
          <label htmlFor="role" className="block text-xs font-medium uppercase text-gray-500">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded border bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="">-- Select role --</option>
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <button
            disabled={!role}
            onClick={() => router.push(`/login?role=${role}`)}
            className="w-full rounded bg-emerald-700 p-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Login
          </button>
        </div>

        <p className="border-t pt-4 text-center text-sm text-gray-600">
          New partner?{" "}
          <Link href="/signup" className="font-medium text-emerald-700 underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}