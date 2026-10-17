"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  role: string;
  isActive: boolean;
};

const roles = [
  { label: "Partner", value: "PARTNER" },
  { label: "District Admin", value: "DISTRICT_ADMIN" },
  { label: "Sub Super", value: "SUB_SUPER" },
  { label: "Finance", value: "FINANCE" },
  { label: "Packing", value: "PACKING" },
  { label: "Admin", value: "ADMIN" },
];

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function update(id: number, data: { role?: string; isActive?: boolean }) {
    setError("");
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? "Update failed");
      return;
    }
    load();
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full border text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Mobile</th>
              <th className="p-2">Role</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.mobile ?? "-"}</td>
                <td className="p-2">
                  <select
                    value={u.role}
                    onChange={(e) => update(u.id, { role: e.target.value })}
                    className="rounded border p-1"
                  >
                    {u.role === "STUDENT" && <option value="STUDENT">Student</option>}
                    {roles.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <button
                    onClick={() => update(u.id, { isActive: !u.isActive })}
                    className={`rounded px-2 py-1 text-white ${u.isActive ? "bg-green-600" : "bg-gray-500"}`}
                  >
                    {u.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}