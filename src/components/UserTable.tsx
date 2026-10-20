"use client";

import { useEffect, useMemo, useState } from "react";
import Icon, { type IconName } from "@/components/icons";

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

// Full class names are written out so Tailwind can detect them.
const ROLE_DOT: Record<string, string> = {
  STUDENT: "bg-slate-400",
  PARTNER: "bg-emerald-500",
  DISTRICT_ADMIN: "bg-blue-500",
  SUB_SUPER: "bg-violet-500",
  FINANCE: "bg-amber-500",
  PACKING: "bg-orange-500",
  ADMIN: "bg-rose-500",
};

const TONES = {
  blue: {
    card: "border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50",
    tile: "bg-blue-500",
    label: "text-blue-700",
  },
  emerald: {
    card: "border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50",
    tile: "bg-emerald-500",
    label: "text-emerald-700",
  },
  rose: {
    card: "border-rose-100 bg-gradient-to-br from-rose-50 to-pink-50",
    tile: "bg-rose-500",
    label: "text-rose-700",
  },
  violet: {
    card: "border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50",
    tile: "bg-violet-500",
    label: "text-violet-700",
  },
} as const;
type Tone = keyof typeof TONES;

function roleLabel(value: string) {
  if (value === "STUDENT") return "Student";
  return roles.find((r) => r.value === value)?.label ?? value;
}

function initials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
}

type StatusFilter = "all" | "active" | "inactive";

export default function UserTable({ currentUserId = null }: { currentUserId?: number | null }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  async function load() {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error();
      setUsers(await res.json());
    } catch {
      setError("Could not load users. Refresh the page and try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function update(id: number, data: { role?: string; isActive?: boolean }) {
    setError("");
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Update failed");
        return;
      }
      await load();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSavingId(null);
    }
  }

  function toggleStatus(u: User) {
    if (u.isActive && !window.confirm(`Deactivate ${u.name}? They will not be able to sign in.`)) {
      return;
    }
    update(u.id, { isActive: !u.isActive });
  }

  function changeRole(u: User, role: string) {
    if (role === u.role) return;
    if (role === "ADMIN" && !window.confirm(`Give ${u.name} full Admin access?`)) return;
    update(u.id, { role });
  }

  const activeCount = users.filter((u) => u.isActive).length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  const stats: { label: string; value: number; hint: string; icon: IconName; tone: Tone }[] = [
    { label: "Total users", value: users.length, hint: "Across all roles", icon: "users", tone: "blue" },
    { label: "Active", value: activeCount, hint: "Can sign in", icon: "userCheck", tone: "emerald" },
    { label: "Inactive", value: users.length - activeCount, hint: "Sign-in disabled", icon: "userX", tone: "rose" },
    { label: "Admins", value: adminCount, hint: "Full access", icon: "shield", tone: "violet" },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (statusFilter === "active" && !u.isActive) return false;
      if (statusFilter === "inactive" && u.isActive) return false;
      if (!q) return true;
      return [u.name, u.email, u.mobile].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
    });
  }, [users, query, roleFilter, statusFilter]);

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const t = TONES[s.tone];
          return (
            <div key={s.label} className={`rounded-2xl border p-4 ${t.card}`}>
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${t.tile}`}>
                  <Icon name={s.icon} className="h-5 w-5" />
                </span>
                <p className={`text-xs font-bold uppercase tracking-wide ${t.label}`}>{s.label}</p>
              </div>
              <p className="mt-4 text-3xl font-bold tabular-nums text-slate-900">{loading ? "–" : s.value}</p>
              <p className="mt-0.5 text-sm text-slate-500">{s.hint}</p>
            </div>
          );
        })}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
        >
          <span>{error}</span>
          <button onClick={() => setError("")} className="font-medium hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email or mobile"
            aria-label="Search users"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Filter by role"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
          >
            <option value="ALL">All roles</option>
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
            <option value="STUDENT">Student</option>
          </select>

          <div
            role="group"
            aria-label="Filter by status"
            className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-sm"
          >
            {statusTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setStatusFilter(t.key)}
                aria-pressed={statusFilter === t.key}
                className={`rounded-lg px-3 py-1.5 font-medium transition ${
                  statusFilter === t.key ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">All users</h2>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {filtered.length === users.length ? `${users.length} total` : `${filtered.length} of ${users.length}`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Mobile</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} aria-hidden="true">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 animate-pulse rounded-full bg-slate-100" />
                        <div className="space-y-2">
                          <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
                          <div className="h-3 w-44 animate-pulse rounded bg-slate-100" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-100" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 w-24 animate-pulse rounded-full bg-slate-100" />
                    </td>
                  </tr>
                ))}

              {!loading &&
                filtered.map((u) => {
                  const saving = savingId === u.id;
                  const isSelf = currentUserId !== null && u.id === currentUserId;
                  const locked = saving || isSelf;
                  return (
                    <tr
                      key={u.id}
                      className={`align-middle transition-colors hover:bg-blue-50/40 ${saving ? "opacity-60" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                              u.isActive ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-500"
                            }`}
                            aria-hidden="true"
                          >
                            {initials(u.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 font-semibold text-slate-900">
                              <span className="truncate">{u.name}</span>
                              {isSelf && (
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                              <Icon name="mail" className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{u.email}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 tabular-nums text-slate-700">
                        {u.mobile ? (
                          <span className="flex items-center gap-1.5">
                            <Icon name="phone" className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            {u.mobile}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`h-2.5 w-2.5 shrink-0 rounded-full ${ROLE_DOT[u.role] ?? "bg-slate-400"}`}
                            title={roleLabel(u.role)}
                            aria-hidden="true"
                          />
                          <select
                            value={u.role}
                            disabled={locked}
                            onChange={(e) => changeRole(u, e.target.value)}
                            aria-label={`Role for ${u.name}`}
                            title={isSelf ? "You cannot change your own role" : undefined}
                            className="w-40 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                          >
                            {u.role === "STUDENT" && <option value="STUDENT">Student</option>}
                            {roles.map((r) => (
                              <option key={r.value} value={r.value}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(u)}
                          disabled={locked}
                          role="switch"
                          aria-checked={u.isActive}
                          aria-label={`${u.isActive ? "Deactivate" : "Activate"} ${u.name}`}
                          title={isSelf ? "You cannot deactivate your own account" : undefined}
                          className="group inline-flex items-center gap-2.5 disabled:cursor-not-allowed"
                        >
                          <span
                            className={`relative h-5 w-9 rounded-full transition-colors ${
                              u.isActive ? "bg-emerald-500" : "bg-slate-300"
                            } ${isSelf ? "opacity-50" : ""}`}
                          >
                            <span
                              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                                u.isActive ? "left-[18px]" : "left-0.5"
                              }`}
                            />
                          </span>
                          <span className={`text-xs font-medium ${u.isActive ? "text-emerald-700" : "text-slate-500"}`}>
                            {u.isActive ? "Active" : "Inactive"}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-14 text-center">
                    <p className="font-medium text-slate-700">
                      {users.length === 0 ? "No users yet" : "No users match your filters"}
                    </p>
                    {users.length > 0 && (
                      <button
                        onClick={() => {
                          setQuery("");
                          setRoleFilter("ALL");
                          setStatusFilter("all");
                        }}
                        className="mt-3 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}