"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

const TOPICS = ["Course enquiry", "Order or delivery help", "Become a partner", "Something else"] as const;
const MAX = 1000;

const field =
  "w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2";
const ok = "border-slate-200 focus:border-brand-600 focus:ring-brand-600/15";
const bad = "border-red-300 focus:border-red-500 focus:ring-red-500/15";

type Values = { name: string; email: string; mobile: string; topic: string; message: string; website: string };
const EMPTY: Values = { name: "", email: "", mobile: "", topic: TOPICS[0], message: "", website: "" };

function check(v: Values) {
  const e: Partial<Record<keyof Values, string>> = {};
  if (v.name.trim().length < 2) e.name = "Enter your name";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Enter a valid email address";
  if (v.mobile.trim() && !/^[6-9]\d{9}$/.test(v.mobile.trim())) e.mobile = "Enter a 10-digit mobile number";
  if (v.message.trim().length < 10) e.message = "Please write at least 10 characters";
  return e;
}

export default function ContactForm() {
  const [v, setV] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [serverError, setServerError] = useState("");

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setV((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
    setServerError("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = check(v);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("sending");
    setServerError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Could not send your message");
      }
      setStatus("sent");
      setV(EMPTY);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="flex flex-col items-center justify-center rounded-3xl border border-brand-100 bg-white p-10 text-center shadow-sm">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h2 className="mt-5 text-2xl font-black text-brand-900">Message sent</h2>
        <p className="mt-2 max-w-sm text-slate-600">
          Thank you for reaching out. Our team will get back to you soon.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-full border border-brand-200 px-5 py-2.5 text-sm font-bold text-brand-800 hover:bg-brand-50"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm md:p-8"
    >
      <h2 className="text-2xl font-black text-brand-900">Send us a message</h2>
      <p className="mt-1 text-sm text-slate-500">Fill in the form and we will reply by email or phone.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-700">Your name</span>
          <input
            className={`${field} h-11 ${errors.name ? bad : ok}`}
            value={v.name}
            onChange={(e) => set("name", e.target.value)}
            autoComplete="name"
            maxLength={80}
            placeholder="Full name"
          />
          {errors.name && <span className="text-xs text-red-600">{errors.name}</span>}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-700">Email</span>
          <input
            type="email"
            className={`${field} h-11 ${errors.email ? bad : ok}`}
            value={v.email}
            onChange={(e) => set("email", e.target.value)}
            autoComplete="email"
            maxLength={120}
            placeholder="you@example.com"
          />
          {errors.email && <span className="text-xs text-red-600">{errors.email}</span>}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-700">
            Mobile <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <input
            inputMode="numeric"
            className={`${field} h-11 ${errors.mobile ? bad : ok}`}
            value={v.mobile}
            onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
            autoComplete="tel-national"
            placeholder="10-digit number"
          />
          {errors.mobile && <span className="text-xs text-red-600">{errors.mobile}</span>}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-700">Topic</span>
          <select className={`${field} h-11 ${ok}`} value={v.topic} onChange={(e) => set("topic", e.target.value)}>
            {TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-sm font-semibold text-slate-700">Message</span>
          <textarea
            rows={5}
            className={`${field} py-3 ${errors.message ? bad : ok}`}
            value={v.message}
            onChange={(e) => set("message", e.target.value.slice(0, MAX))}
            placeholder="How can we help you?"
          />
          <span className="flex justify-between text-xs">
            <span className="text-red-600">{errors.message}</span>
            <span className="text-slate-400">
              {v.message.length}/{MAX}
            </span>
          </span>
        </label>

        {/* Spam rokne ke liye chhupa hua field: insaan ise nahi bharta, bots bhar dete hain */}
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label>
            Website
            <input
              tabIndex={-1}
              autoComplete="off"
              value={v.website}
              onChange={(e) => set("website", e.target.value)}
            />
          </label>
        </div>
      </div>

      {serverError && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gold-400 px-7 py-3 font-bold text-brand-900 shadow-lg shadow-gold-500/30 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            Send message <Send className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}