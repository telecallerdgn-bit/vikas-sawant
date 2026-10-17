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
          onClick={() => setOpen(!open)}
          className="mt-1 text-xs font-medium text-emerald-700 underline"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}