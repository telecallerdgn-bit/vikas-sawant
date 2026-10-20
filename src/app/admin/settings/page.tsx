"use client";

import { useEffect, useState } from "react";
import Icon, { type IconName } from "@/components/icons";

const STORAGE_KEY = "academySettings";

type Settings = {
  academyName: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  currency: string;
  timezone: string;
  commission: string;
  emailNotifications: boolean;
  orderNotifications: boolean;
  paymentNotifications: boolean;
  maintenanceMode: boolean;
};

const DEFAULTS: Settings = {
  academyName: "vikas-sawant",
  email: "admin@abcacademy.com",
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  address: "Mumbai, Maharashtra, India",
  currency: "INR",
  timezone: "Asia/Kolkata",
  commission: "10",
  emailNotifications: true,
  orderNotifications: true,
  paymentNotifications: true,
  maintenanceMode: false,
};

type Errors = Partial<Record<keyof Settings, string>>;

function validate(s: Settings): Errors {
  const e: Errors = {};
  if (!s.academyName.trim()) e.academyName = "Academy name is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email.trim())) e.email = "Enter a valid email address";
  const c = Number(s.commission);
  if (s.commission === "" || Number.isNaN(c) || c < 0 || c > 100) e.commission = "Enter a value between 0 and 100";
  return e;
}

const inputCls =
  "h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2";
const okCls = "border-slate-200 focus:border-blue-500 focus:ring-blue-500/15";
const errCls = "border-red-300 focus:border-red-500 focus:ring-red-500/15";

function Field({
  label,
  error,
  full,
  children,
}: {
  label: string;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}

function Section({
  icon,
  title,
  subtitle,
  tone = "blue",
  children,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  tone?: "blue" | "green" | "amber" | "violet" | "red";
  children: React.ReactNode;
}) {
  // Tailwind ko poori class chahiye, isliye rang literal likhe hain
  const tones = {
    blue: "bg-blue-500",
    green: "bg-emerald-500",
    amber: "bg-orange-500",
    violet: "bg-violet-500",
    red: "bg-red-500",
  };
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-5">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${tones[tone]}`}>
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
  onChange,
  danger = false,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-4 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={title}
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
          enabled ? (danger ? "bg-red-500" : "bg-emerald-500") : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all ${
            enabled ? "left-[23px]" : "left-[3px]"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [baseline, setBaseline] = useState<Settings>(DEFAULTS); // last saved
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Pehle save ki hui settings wapas load karo (original code ye karta hi nahi tha)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const merged = { ...DEFAULTS, ...JSON.parse(raw) } as Settings;
        setSettings(merged);
        setBaseline(merged);
      }
    } catch {
      /* kharab ya blocked storage ho to defaults chalenge */
    }
    setLoaded(true);
  }, []);

  const dirty = JSON.stringify(settings) !== JSON.stringify(baseline);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSaved(false);
  }

  const text =
    (key: keyof Settings) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      set(key, e.target.value as never);

  function toggle(key: "emailNotifications" | "orderNotifications" | "paymentNotifications" | "maintenanceMode") {
    if (key === "maintenanceMode" && !settings.maintenanceMode) {
      if (!window.confirm("Turn on maintenance mode? Public access will be disabled once this is saved.")) return;
    }
    set(key, !settings[key]);
  }

  function handleSave() {
    const found = validate(settings);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      setErrors({ academyName: "Could not save in this browser" });
      return;
    }
    setBaseline(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleDiscard() {
    setSettings(baseline);
    setErrors({});
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Super Admin</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">System Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your academy and platform settings.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!dirty}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save changes
        </button>
      </header>

      {saved && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          <Icon name="check" className="h-4 w-4" />
          Settings saved successfully
        </div>
      )}

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          These settings are saved in <b>this browser only</b> for now. They do not change the live platform
          (commission, maintenance mode or notifications) until they are connected to the database.
        </p>
      </div>

      <div className={`grid grid-cols-1 gap-6 xl:grid-cols-2 ${loaded ? "" : "opacity-60"}`}>
        {/* General */}
        <Section icon="info" title="General settings" subtitle="Basic academy information" tone="blue">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Academy name" error={errors.academyName}>
              <input
                className={`${inputCls} ${errors.academyName ? errCls : okCls}`}
                value={settings.academyName}
                onChange={text("academyName")}
                placeholder="Enter academy name"
              />
            </Field>
            <Field label="Email address" error={errors.email}>
              <input
                type="email"
                className={`${inputCls} ${errors.email ? errCls : okCls}`}
                value={settings.email}
                onChange={text("email")}
                placeholder="Enter email"
              />
            </Field>
            <Field label="Phone number">
              <input
                className={`${inputCls} ${okCls}`}
                value={settings.phone}
                onChange={text("phone")}
                placeholder="Enter phone number"
              />
            </Field>
            <Field label="WhatsApp number">
              <input
                className={`${inputCls} ${okCls}`}
                value={settings.whatsapp}
                onChange={text("whatsapp")}
                placeholder="Enter WhatsApp number"
              />
            </Field>
            <Field label="Address" full>
              <input
                className={`${inputCls} ${okCls}`}
                value={settings.address}
                onChange={text("address")}
                placeholder="Enter academy address"
              />
            </Field>
          </div>
        </Section>

        {/* Regional */}
        <Section icon="clock" title="Regional settings" subtitle="Currency and timezone preferences" tone="violet">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Currency">
              <select className={`${inputCls} ${okCls}`} value={settings.currency} onChange={text("currency")}>
                <option value="INR">INR — Indian Rupee (₹)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="EUR">EUR — Euro (€)</option>
                <option value="GBP">GBP — British Pound (£)</option>
              </select>
            </Field>
            <Field label="Timezone">
              <select className={`${inputCls} ${okCls}`} value={settings.timezone} onChange={text("timezone")}>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New_York</option>
              </select>
            </Field>
          </div>
        </Section>

        {/* Commission */}
        <Section icon="rupee" title="Commission settings" subtitle="Configure platform commission" tone="green">
          <Field label="Default commission (%)" error={errors.commission}>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                className={`${inputCls} pr-10 ${errors.commission ? errCls : okCls}`}
                value={settings.commission}
                onChange={text("commission")}
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                %
              </span>
            </div>
          </Field>
          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
            <p>This commission will be applied as the default rate for applicable transactions.</p>
          </div>
        </Section>

        {/* Notifications */}
        <Section icon="mail" title="Notification settings" subtitle="Manage admin notifications" tone="amber">
          <div className="divide-y divide-slate-100">
            <ToggleRow
              title="Email notifications"
              description="Receive important updates by email"
              enabled={settings.emailNotifications}
              onChange={() => toggle("emailNotifications")}
            />
            <ToggleRow
              title="Order notifications"
              description="Get notified when a new order is placed"
              enabled={settings.orderNotifications}
              onChange={() => toggle("orderNotifications")}
            />
            <ToggleRow
              title="Payment notifications"
              description="Receive notifications about payment activity"
              enabled={settings.paymentNotifications}
              onChange={() => toggle("paymentNotifications")}
            />
          </div>
        </Section>

        {/* Security */}
        <div className="xl:col-span-2">
          <Section icon="check" title="System & security" subtitle="Control platform availability" tone="red">
            <ToggleRow
              title="Maintenance mode"
              description="Temporarily disable public access to the platform"
              enabled={settings.maintenanceMode}
              danger
              onChange={() => toggle("maintenanceMode")}
            />
          </Section>
        </div>
      </div>

      {/* Unsaved changes bar */}
      {dirty && (
        <div
          role="region"
          aria-label="Unsaved changes"
          className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-lg sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            You have unsaved changes
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDiscard}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Save changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}