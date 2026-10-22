"use client";

import { useId, useState } from "react";
import { FIELD, LABEL, PRIMARY_BTN } from "@/components/studentadmin/ui";

export default function TopicForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: { title: string; summary: string };
  onSave: (v: { title: string; summary: string }) => Promise<string | null>;
  onCancel: () => void;
}) {
  const uid = useId();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (title.trim().length < 2) {
      setError("Enter the topic title");
      return;
    }
    setSaving(true);
    const err = await onSave({ title: title.trim(), summary });
    setSaving(false);
    if (err) setError(err);
  }

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <div>
        <label htmlFor={`${uid}-title`} className={LABEL}>Topic title</label>
        <input
          id={`${uid}-title`}
          className={FIELD}
          value={title}
          maxLength={160}
          autoFocus
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor={`${uid}-summary`} className={LABEL}>Summary (optional)</label>
        <textarea
          id={`${uid}-summary`}
          className={FIELD}
          rows={2}
          maxLength={1000}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button disabled={saving} className={PRIMARY_BTN}>
          {saving ? "Saving..." : initial ? "Save topic" : "Add topic"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}