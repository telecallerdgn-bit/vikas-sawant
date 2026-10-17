"use client";

import { useState } from "react";

export default function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="rounded border bg-gray-50 px-3 py-2 font-mono text-lg tracking-widest">
        {code}
      </span>
      <button onClick={copy} className="rounded bg-emerald-700 px-3 py-2 text-sm text-white">
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}