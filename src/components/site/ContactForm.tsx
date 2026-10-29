"use client";

import { useState, type ReactNode } from "react";
import { AlertCircle, ArrowRight, CircleCheck, Loader2, Mail, MessageSquare, Smartphone, User } from "lucide-react";

const TOPICS = ["Course enquiry", "Order or delivery help", "Become a partner", "Something else"] as const;
const MAX = 1000;

const field =
  "w-full rounded-xl border bg-brand-50/60 text-sm text-brand-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4";
const ok = "border-brand-100 focus:border-gold-400 focus:ring-gold-400/20";
const bad = "border-red-300 focus:border-red-400 focus:ring-red-200";
const iconCls = "pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-600";

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

function Field({
  id,
  label,
  optional,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-center justify-between text-sm font-bold text-brand-900">
        {label}
        {optional && <span className="text-xs font-medium text-slate-400">Optional</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
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
      <div
        role="status"
        className="flex flex-col items-center justify-center rounded-3xl border border-white bg-white p-10 text-center shadow-2xl shadow-brand-900/10"
      >
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gold-400 text-brand-900 ring-8 ring-gold-100">
          <CircleCheck className="h-10 w-10" />
        </span>
        <h2 className="mt-6 text-3xl font-bold text-brand-900">Message sent</h2>
        <p className="mt-3 max-w-sm text-slate-600">Thank you for reaching out. Our team will get back to you soon.</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-7 rounded-full border-2 border-gold-400 px-6 py-2.5 text-sm font-bold text-brand-900 transition hover:bg-gold-100/60 active:scale-95"
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
      className="relative space-y-5 overflow-hidden rounded-3xl border border-white bg-white p-6 shadow-2xl shadow-brand-900/10 md:p-9"
    >
      <MessageSquare className="pointer-events-none absolute -bottom-8 -right-8 h-40 w-40 text-brand-50" />

      <div className="relative flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-900 text-gold-400 shadow-lg shadow-brand-900/20">
          <MessageSquare className="h-7 w-7" />
        </span>
        <div>
          <h2 className="text-2xl font-bold text-brand-900">Send us a message</h2>
          <p className="text-sm text-slate-500">Fill in the form and we will reply by email or phone.</p>
        </div>
      </div>

      {/* Topic: select ki jagah chips */}
      <div className="relative">
        <p id="topic-label" className="mb-2 text-sm font-bold text-brand-900">
          What is this about?
        </p>
        <div role="radiogroup" aria-labelledby="topic-label" className="flex flex-wrap gap-2">
          {TOPICS.map((t) => {
            const active = v.topic === t;
            return (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => set("topic", t)}
                className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 ${
                  active
                    ? "border-brand-900 bg-brand-900 text-white shadow-md shadow-brand-900/20"
                    : "border-brand-100 bg-white text-brand-800 hover:border-gold-400 hover:bg-gold-100/40"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Your name" error={errors.name}>
          <div className="relative">
            <User className={iconCls} />
            <input
              id="name"
              className={`${field} h-12 pl-12 pr-4 ${errors.name ? bad : ok}`}
              value={v.name}
              onChange={(e) => set("name", e.target.value)}
              autoComplete="name"
              maxLength={80}
              placeholder="Full name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
          </div>
        </Field>

        <Field id="email" label="Email" error={errors.email}>
          <div className="relative">
            <Mail className={iconCls} />
            <input
              id="email"
              type="email"
              className={`${field} h-12 pl-12 pr-4 ${errors.email ? bad : ok}`}
              value={v.email}
              onChange={(e) => set("email", e.target.value)}
              autoComplete="email"
              maxLength={120}
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
          </div>
        </Field>

        <Field id="mobile" label="Mobile" optional error={errors.mobile} className="sm:col-span-2">
          <div className="relative">
            <Smartphone className={iconCls} />
            <span className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 border-r border-brand-200 pr-3 text-sm font-semibold text-brand-900">
              +91
            </span>
            <input
              id="mobile"
              inputMode="numeric"
              className={`${field} h-12 pl-[6.25rem] pr-4 ${errors.mobile ? bad : ok}`}
              value={v.mobile}
              onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
              autoComplete="tel-national"
              placeholder="10-digit number"
              aria-invalid={!!errors.mobile}
              aria-describedby={errors.mobile ? "mobile-error" : undefined}
            />
          </div>
        </Field>

        <div className="sm:col-span-2">
          <label htmlFor="message" className="mb-1.5 block text-sm font-bold text-brand-900">
            Message
          </label>
          <textarea
            id="message"
            rows={5}
            className={`${field} px-4 py-3.5 ${errors.message ? bad : ok}`}
            value={v.message}
            onChange={(e) => set("message", e.target.value.slice(0, MAX))}
            placeholder="How can we help you?"
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "message-error" : undefined}
          />
          <span className="mt-1.5 flex justify-between text-xs">
            <span id="message-error" className="font-semibold text-red-600">
              {errors.message}
            </span>
            <span className="text-slate-400">
              {v.message.length}/{MAX}
            </span>
          </span>
        </div>

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
        <div role="alert" className="relative flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-brand-900/20 transition hover:bg-brand-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            Send message <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}