"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type ProfileInitial = {
  name: string;
  mobile: string;
  email: string;
  addressLine: string;
  city: string;
  pincode: string;
};

const FIELD =
  "w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none focus:border-[#f8b915] focus:ring-2 focus:ring-[#f8b915]/30";
const LABEL = "mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500";
const BTN =
  "rounded-xl bg-[#f8b915] px-5 py-2.5 text-sm font-bold text-[#0b2149] hover:bg-[#e3a600] disabled:opacity-50";

async function patch(body: Record<string, unknown>) {
  const res = await fetch("/api/student/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, error: (data.error as string | undefined) ?? "Something went wrong" };
}

export default function ProfileForm({ initial }: { initial: ProfileInitial }) {
  const router = useRouter();

  const [f, setF] = useState(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    const r = await patch({
      action: "save",
      name: f.name,
      email: f.email,
      addressLine: f.addressLine,
      city: f.city,
      pincode: f.pincode,
    });
    setSaving(false);
    setMsg(r.ok ? { ok: true, text: "Saved." } : { ok: false, text: r.error });
    if (r.ok) router.refresh();
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (next !== again) {
      setPwMsg({ ok: false, text: "The new passwords do not match" });
      return;
    }
    setPwSaving(true);
    const r = await patch({ action: "change_password", currentPassword: current, newPassword: next });
    setPwSaving(false);
    if (r.ok) {
      setCurrent("");
      setNext("");
      setAgain("");
      setPwMsg({ ok: true, text: "Password changed." });
    } else {
      setPwMsg({ ok: false, text: r.error });
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={save} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-[#0b2149]">Your details</h2>

        <div>
          <label className={LABEL}>Name</label>
          <input className={FIELD} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
        </div>
        <div>
          <label className={LABEL}>Mobile (your login)</label>
          <input className={`${FIELD} bg-slate-50 text-slate-500`} value={f.mobile} disabled />
          <p className="mt-1 text-xs text-slate-500">To change your mobile number, please contact support.</p>
        </div>
        <div>
          <label className={LABEL}>Email</label>
          <input className={FIELD} type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h3 className="text-sm font-bold text-[#0b2149]">Delivery address for books</h3>
          <div className="mt-3 space-y-4">
            <div>
              <label className={LABEL}>Address</label>
              <input className={FIELD} value={f.addressLine} onChange={(e) => setF({ ...f, addressLine: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>
          </div>
        </div>

        {msg && (
          <p className={`rounded-xl p-3 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {msg.text}
          </p>
        )}
        <button disabled={saving} className={BTN}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>

      <form onSubmit={changePassword} className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-[#0b2149]">Change password</h2>

        <div>
          <label className={LABEL}>Current password</label>
          <input className={FIELD} type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        </div>
        <div>
          <label className={LABEL}>New password</label>
          <input className={FIELD} type="password" autoComplete="new-password" placeholder="At least 8 characters" value={next} onChange={(e) => setNext(e.target.value)} required />
        </div>
        <div>
          <label className={LABEL}>Repeat new password</label>
          <input className={FIELD} type="password" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} required />
        </div>

        {pwMsg && (
          <p className={`rounded-xl p-3 text-sm ${pwMsg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {pwMsg.text}
          </p>
        )}
        <button disabled={pwSaving} className={BTN}>
          {pwSaving ? "Changing..." : "Change password"}
        </button>
      </form>
    </div>
  );
}