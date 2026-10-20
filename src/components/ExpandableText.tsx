"use client";

import { useState } from "react";

export default function ExpandableText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 90;

  return (
    <div className="max-w-xs">
      <p className={open || !long ? "" : "line-clamp-2"}>{text}</p>
      {long && (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="mt-1 text-xs font-medium text-brand-700 underline underline-offset-2 hover:text-brand-900"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}