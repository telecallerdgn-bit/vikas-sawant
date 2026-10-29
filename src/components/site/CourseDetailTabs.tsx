"use client";

import { useState, type ReactNode } from "react";

export type DetailTab = { key: string; label: string; content: ReactNode };

export default function CourseDetailTabs({ tabs }: { tabs: DetailTab[] }) {
  const [active, setActive] = useState(tabs[0]?.key ?? "");
  if (tabs.length === 0) return null;

  return (
    <section className="rounded-3xl border border-brand-100 bg-white p-7 md:p-9">
      <h2 className="text-2xl font-bold text-brand-900">More details</h2>

      <div role="tablist" aria-label="More details" className="mt-5 flex overflow-x-auto rounded-xl bg-brand-50 p-1">
        {tabs.map((t) => {
          const on = t.key === active;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              id={`tab-${t.key}`}
              aria-selected={on}
              aria-controls={`panel-${t.key}`}
              onClick={() => setActive(t.key)}
              className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-bold transition-colors ${
                on ? "bg-brand-900 text-white shadow" : "text-slate-600 hover:bg-brand-100"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tabs.map((t) => (
        <div
          key={t.key}
          role="tabpanel"
          id={`panel-${t.key}`}
          aria-labelledby={`tab-${t.key}`}
          hidden={t.key !== active}
          className="mt-2"
        >
          {t.content}
        </div>
      ))}
    </section>
  );
}