"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  splitOrder,
  validateRule,
  type GatewayMode,
  type InactiveRule,
  type Person,
  type RuleValues,
  type SubSuperBase,
} from "@/lib/commission-calc";

export type Sample = {
  isReal: boolean;
  title: string;
  partnerName: string;
  pricePaise: number;
  chain: Person[];
  districtAdmin: Person | null;
  subSuper: Person | null;
};

type Props = {
  initial: RuleValues;
  currentVersion: number | null; // null = abhi tak koi version save nahi hua
  approved: boolean;
  sample: Sample;
};

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 });
const money = (paise: number) => inr.format(paise / 100);

const fieldCls =
  "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:ring-2";
const okCls = "border-slate-200 focus:border-blue-500 focus:ring-blue-500/15";
const badCls = "border-red-300 focus:border-red-500 focus:ring-red-500/15";

const num = (v: string) => (v.trim() === "" ? NaN : Number(v));

type Form = {
  levels: string[];
  district: string;
  subSuper: string;
  subSuperBase: SubSuperBase;
  inactive: InactiveRule;
  gateway: GatewayMode;
  gst: string;
  fee: string;
  note: string;
};

function toForm(r: RuleValues): Form {
  return {
    levels: r.levels.map(String),
    district: String(r.district),
    subSuper: String(r.subSuper),
    subSuperBase: r.subSuperBase,
    inactive: r.inactive,
    gateway: r.gateway,
    gst: String(r.gstPercent),
    fee: String(r.gatewayFeePercent),
    note: "",
  };
}

function toRule(f: Form): RuleValues {
  return {
    levels: f.levels.map(num),
    district: num(f.district),
    subSuper: num(f.subSuper),
    subSuperBase: f.subSuperBase,
    inactive: f.inactive,
    gateway: f.gateway,
    gstPercent: num(f.gst),
    gatewayFeePercent: num(f.fee),
  };
}

function PercentField({
  label,
  hint = "% of distributable",
  value,
  onChange,
  invalid,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  invalid: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        max={100}
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldCls} ${invalid ? badCls : okCls}`}
      />
      <span className="text-xs text-slate-400">{hint}</span>
    </label>
  );
}

function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={`${fieldCls} ${okCls}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function CommissionEditor({ initial, currentVersion, approved, sample }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<Form>(() => toForm(initial));
  const [busy, setBusy] = useState<"save" | "approve" | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const baseline = useMemo(() => JSON.stringify(toForm(initial)), [initial]);
  const dirty = JSON.stringify({ ...form, note: "" }) !== baseline;

  const rule = toRule(form);
  const hasEmpty = [...rule.levels, rule.district, rule.subSuper, rule.gstPercent, rule.gatewayFeePercent].some(
    (n) => Number.isNaN(n),
  );
  const problem = hasEmpty ? "Fill in every percentage" : validateRule(rule);

  // Preview ke liye khali field ko 0 maan lo, taaki ye beech me toote nahi
  const previewRule: RuleValues = {
    ...rule,
    levels: rule.levels.map((n) => (Number.isFinite(n) ? n : 0)),
    district: Number.isFinite(rule.district) ? rule.district : 0,
    subSuper: Number.isFinite(rule.subSuper) ? rule.subSuper : 0,
    gstPercent: Number.isFinite(rule.gstPercent) ? rule.gstPercent : 0,
    gatewayFeePercent: Number.isFinite(rule.gatewayFeePercent) ? rule.gatewayFeePercent : 0,
  };
  const split = useMemo(
    () =>
      splitOrder({
        pricePaise: sample.pricePaise,
        rule: previewRule,
        chain: sample.chain,
        districtAdmin: sample.districtAdmin,
        subSuper: sample.subSuper,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(previewRule), sample],
  );

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setError("");
    setMessage("");
  }
  const setLevel = (i: number, v: string) => set("levels", form.levels.map((x, idx) => (idx === i ? v : x)));

  async function post(body: unknown, kind: "save" | "approve") {
    setBusy(kind);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/commission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong");
      setMessage(kind === "save" ? `Saved as version ${data.version}` : "Marked as owner-approved");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  function save() {
    if (problem) return;
    post(
      {
        action: "save",
        levels: rule.levels,
        district: rule.district,
        subSuper: rule.subSuper,
        subSuperBase: rule.subSuperBase,
        inactive: rule.inactive,
        gateway: rule.gateway,
        gstPercent: rule.gstPercent,
        gatewayFeePercent: rule.gatewayFeePercent,
        note: form.note.trim() || undefined,
      },
      "save",
    );
  }

  const nextVersion = (currentVersion ?? 0) + 1;
  const badge =
    currentVersion === null
      ? { text: "Not saved yet", cls: "bg-slate-100 text-slate-600" }
      : approved
        ? { text: "Approved", cls: "bg-emerald-100 text-emerald-800" }
        : { text: "Pending approval", cls: "bg-amber-100 text-amber-800" };

  const invalidPct = (v: string) => Number.isNaN(num(v)) || num(v) < 0 || num(v) > 100;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      {/* ---------------- Rule form ---------------- */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900">
            {currentVersion === null ? "New commission rule" : `Rule version ${currentVersion}`}
          </h2>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.cls}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {badge.text}
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <PercentField label="Level 1 · Direct partner" value={form.levels[0]} onChange={(v) => setLevel(0, v)} invalid={invalidPct(form.levels[0])} />
          <PercentField label="Level 2 referral" value={form.levels[1]} onChange={(v) => setLevel(1, v)} invalid={invalidPct(form.levels[1])} />
          <PercentField label="Level 3 referral" value={form.levels[2]} onChange={(v) => setLevel(2, v)} invalid={invalidPct(form.levels[2])} />
          <PercentField label="Level 4 referral" value={form.levels[3]} onChange={(v) => setLevel(3, v)} invalid={invalidPct(form.levels[3])} />
          <PercentField label="Level 5 referral" value={form.levels[4]} onChange={(v) => setLevel(4, v)} invalid={invalidPct(form.levels[4])} />
          <PercentField label="District Admin" value={form.district} onChange={(v) => set("district", v)} invalid={invalidPct(form.district)} />
          <PercentField
            label="Sub Super Admin share"
            hint="%"
            value={form.subSuper}
            onChange={(v) => set("subSuper", v)}
            invalid={invalidPct(form.subSuper)}
          />

          <SelectField<SubSuperBase>
            label={`${form.subSuper || 0}% calculated on`}
            value={form.subSuperBase}
            onChange={(v) => set("subSuperBase", v)}
            options={[
              { value: "REMAINDER", label: "Remainder after partners & district" },
              { value: "DISTRIBUTABLE", label: "Total distributable amount" },
            ]}
          />
          <SelectField<InactiveRule>
            label="Inactive partner in chain"
            value={form.inactive}
            onChange={(v) => set("inactive", v)}
            options={[
              { value: "SKIP_TO_SUPER_ADMIN", label: "Skip, share goes to Super Admin" },
              { value: "COMPRESS", label: "Compress, next active partner moves up" },
            ]}
          />
          <SelectField<GatewayMode>
            label="Payment gateway fee"
            value={form.gateway}
            onChange={(v) => set("gateway", v)}
            options={[
              { value: "DEDUCT_FIRST", label: "Deduct before splitting" },
              { value: "SUPER_ADMIN_BEARS", label: "Super Admin bears the fee" },
            ]}
          />

          <PercentField label="GST (inclusive)" hint="% inside the course price" value={form.gst} onChange={(v) => set("gst", v)} invalid={Number.isNaN(num(form.gst))} />
          <PercentField label="Gateway fee" hint="% of the course price" value={form.fee} onChange={(v) => set("fee", v)} invalid={Number.isNaN(num(form.fee))} />
        </div>

        <label className="mt-5 flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-700">
            Note for this version <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <input
            value={form.note}
            onChange={(e) => set("note", e.target.value.slice(0, 200))}
            placeholder="Why are you changing the rule?"
            className={`${fieldCls} ${okCls}`}
          />
        </label>

        {problem && dirty && (
          <p role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
            {problem}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800">
            {message}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={save}
            disabled={!dirty || !!problem || busy !== null}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy === "save" ? "Saving…" : `Save as version ${nextVersion}`}
          </button>
          <button
            onClick={() => currentVersion !== null && post({ action: "approve", version: currentVersion }, "approve")}
            disabled={currentVersion === null || approved || dirty || busy !== null}
            title={dirty ? "Save your changes first" : undefined}
            className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy === "approve" ? "Approving…" : approved ? "Owner-approved" : "Mark current version owner-approved"}
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          New versions apply to orders paid after saving. Past commission keeps the version it was calculated with.
        </p>
      </section>

      {/* ---------------- Live preview ---------------- */}
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-24">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Live preview · {sample.title}
        </p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {money(sample.pricePaise)} via {sample.partnerName}
          {!sample.isReal && (
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 normal-case tracking-normal text-slate-500">
              sample data
            </span>
          )}
        </p>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="font-semibold text-slate-900">Course price (incl. GST)</dt>
            <dd className="font-mono tabular-nums">{money(split.pricePaise)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-slate-600">
            <dt>− GST {previewRule.gstPercent}% (inclusive)</dt>
            <dd className="font-mono tabular-nums">{money(split.gstPaise)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-slate-600">
            <dt>
              − Gateway fee{!split.feeDeducted && <span className="text-slate-400"> (Super Admin bears)</span>}
            </dt>
            <dd className="font-mono tabular-nums">{money(split.feePaise)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
            <dt className="font-semibold text-slate-900">Distributable</dt>
            <dd className="font-mono font-semibold tabular-nums">{money(split.distributablePaise)}</dd>
          </div>
        </dl>

        <ul className="mt-3 space-y-3">
          {split.lines.map((l) => (
            <li key={l.key} className="flex justify-between gap-4 text-sm">
              <div className="min-w-0">
                <p className={l.muted ? "text-slate-400 line-through" : "text-slate-800"}>
                  {l.label}
                  {l.person && <span> · {l.person}</span>}
                </p>
                <p className="text-xs text-slate-400">
                  {l.note
                    ? l.note
                    : l.percent !== null
                      ? `${l.percent}% of ${l.baseLabel ?? "distributable"}${
                          l.baseLabel === "remainder" && l.basePaise !== undefined ? ` ${money(l.basePaise)}` : ""
                        }`
                      : "Whatever is left"}
                </p>
              </div>
              <span
                className={`shrink-0 font-mono tabular-nums ${
                  l.muted ? "text-slate-300" : l.paise < 0 ? "text-red-600" : "text-slate-900"
                }`}
              >
                {money(l.paise)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 border-t border-slate-100 pt-3 text-sm">
          <p className="text-slate-600">Allocated total vs distributable</p>
          <p className="mt-1 font-mono text-sm tabular-nums text-slate-900">
            {money(split.allocatedPaise)} · difference {money(split.differencePaise)}
          </p>
        </div>
      </aside>
    </div>
  );
}