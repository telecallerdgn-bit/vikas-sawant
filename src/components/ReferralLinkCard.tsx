"use client";

import { useState } from "react";
import Icon from "@/components/icons";

export default function ReferralLinkCard({ code, link }: { code: string; link: string }) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  async function copy(value: string, which: "code" | "link") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // Clipboard access can be blocked. The text is still selectable.
    }
  }

  const message = encodeURIComponent(`Check out these courses and enrol using my link: ${link}`);
  const btn =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors";

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your referral code</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="font-mono text-3xl font-bold tracking-wide text-slate-900">{code}</p>
          <button type="button" onClick={() => copy(code, "code")} className={`${btn} border border-slate-300 text-slate-700 hover:bg-slate-50`}>
            <Icon name="copy" className="h-4 w-4" />
            {copied === "code" ? "Copied" : "Copy code"}
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your referral link</p>
        <input
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Your referral link"
          className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-sm text-slate-800"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => copy(link, "link")} className={`${btn} bg-blue-600 text-white hover:bg-blue-700`}>
          <Icon name="link" className="h-4 w-4" />
          {copied === "link" ? "Link copied" : "Copy link"}
        </button>
        <a href={`https://wa.me/?text=${message}`} target="_blank" rel="noopener noreferrer" className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}>
          Share on WhatsApp
        </a>
        <a href={`mailto:?subject=${encodeURIComponent("Courses you may like")}&body=${message}`} className={`${btn} border border-slate-300 text-slate-700 hover:bg-slate-50`}>
          <Icon name="mail" className="h-4 w-4" />
          Share by email
        </a>
      </div>
    </section>
  );
}