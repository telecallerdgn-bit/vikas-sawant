"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import StatusToggleButton from "@/components/studentadmin/StatusToggleButton";
import { FIELD, LABEL, PRIMARY_BTN } from "@/components/studentadmin/ui";

export type StudentInitial = {
  id: number;
  name: string;
  mobile: string;
  email: string;
  addressLine: string;
  city: string;
  pincode: string;
  partnerCode: string;
  isActive: boolean;
};

export default function StudentEditForm({ initial }: { initial: StudentInitial }) {
  const router = useRouter();
  const url = `/api/student-admin/students/${initial.id}`;
  const [f, setF] = useState(initial);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const [pw, setPw] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setLoading(true);
    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          name: f.name,
          mobile: f.mobile,
          email: f.email,
          addressLine: f.addressLine,
          city: f.city,
          pincode: f.pincode,
          partnerCode: f.partnerCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    setPwMsg(null);
    if (pw.length < 8) {
      setPwMsg({ ok: false, text: "Password must be at least 8 characters" });
      return;
    }
    if (!confirm("Set this as the student's new password?")) return;

    setPwLoading(true);
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset_password", newPassword: pw }),
    });
    setPwLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPwMsg({ ok: false, text: data.error ?? "Could not reset" });
      return;
    }
    setPw("");
    setPwMsg({ ok: true, text: "Password changed. Tell the student the new password." });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Student details</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL}>Name</label>
            <input className={FIELD} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
          </div>
          <div>
            <label className={LABEL}>Mobile (login)</label>
            <input
              className={FIELD}
              inputMode="numeric"
              value={f.mobile}
              onChange={(e) => setF({ ...f, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL}>Email</label>
            <input className={FIELD} type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL}>Address</label>
            <input className={FIELD} value={f.addressLine} onChange={(e) => setF({ ...f, addressLine: e.target.value })} />
          </div>
          <div>
            <label className={LABEL}>City</label>
            <input className={FIELD} value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
          </div>
          <div>
            <label className={LABEL}>Pincode</label>
            <input
              className={FIELD}
              inputMode="numeric"
              value={f.pincode}
              onChange={(e) => setF({ ...f, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL}>Partner referral code</label>
            <input
              className={`${FIELD} font-mono`}
              placeholder="Leave empty for a direct student"
              value={f.partnerCode}
              onChange={(e) => setF({ ...f, partnerCode: e.target.value.toUpperCase() })}
            />
            <p className="mt-1 text-xs text-slate-500">
              Cannot be changed once the student has a paid order, because commission is linked to the partner.
            </p>
          </div>
        </div>

        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {saved && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">Saved.</p>}

        <button disabled={loading} className={PRIMARY_BTN}>
          {loading ? "Saving..." : "Save changes"}
        </button>
      </form>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Account</h2>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
          <div>
            <p className="text-sm font-medium text-slate-900">{initial.isActive ? "Account is active" : "Account is disabled"}</p>
            <p className="text-xs text-slate-500">A disabled student cannot log in.</p>
          </div>
          <StatusToggleButton
            url={url}
            active={initial.isActive}
            activateLabel="Enable account"
            deactivateLabel="Disable account"
            confirmDeactivate="Disable this student? They will not be able to log in."
          />
        </div>

        <div>
          <label className={LABEL}>Set a new password</label>
          <div className="flex gap-2">
            <input
              className={FIELD}
              type="text"
              autoComplete="off"
              placeholder="At least 8 characters"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
            <button
              type="button"
              disabled={pwLoading}
              onClick={resetPassword}
              className="shrink-0 rounded-xl border border-slate-200 px-4 text-sm hover:bg-slate-50 disabled:opacity-50"
            >
              {pwLoading ? "..." : "Reset"}
            </button>
          </div>
          {pwMsg && <p className={`mt-2 text-sm ${pwMsg.ok ? "text-emerald-700" : "text-red-600"}`}>{pwMsg.text}</p>}
        </div>
      </section>
    </div>
  );
}