"use client";

import { useId, useState } from "react";
import { FIELD, LABEL, PRIMARY_BTN } from "@/components/studentadmin/ui";
import type { LessonDTO, LessonType } from "@/lib/curriculum";
import { PROVIDER_LABEL, parseVideo } from "@/lib/video";

export type LessonPayload = {
  title: string;
  type: LessonType;
  content: string;
  videoUrl: string;
  liveUrl: string;
  liveStartsAt: string | null;
  durationMin: number | null;
  isPreview: boolean;
  isPublished: boolean;
};

const TYPES: { value: LessonType; label: string; hint: string }[] = [
  { value: "VIDEO", label: "Video", hint: "Recorded lesson" },
  { value: "TEXT", label: "Text", hint: "Reading material" },
  { value: "LIVE", label: "Live class", hint: "Zoom or Meet link" },
];

// Turns a stored ISO date into the value a datetime-local input expects.
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function LessonForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: LessonDTO;
  onSave: (v: LessonPayload) => Promise<string | null>;
  onCancel: () => void;
}) {
  const uid = useId();
  const id = (n: string) => `${uid}-${n}`;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState<LessonType>(initial?.type ?? "VIDEO");
  const [content, setContent] = useState(initial?.content ?? "");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [liveUrl, setLiveUrl] = useState(initial?.liveUrl ?? "");
  const [liveStartsAt, setLiveStartsAt] = useState(toLocalInput(initial?.liveStartsAt ?? null));
  const [duration, setDuration] = useState(initial?.durationMin != null ? String(initial.durationMin) : "");
  const [isPreview, setIsPreview] = useState(initial?.isPreview ?? false);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const video = videoUrl.trim() ? parseVideo(videoUrl) : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (title.trim().length < 2) return setError("Enter the lesson title");
    if (type === "VIDEO" && !parseVideo(videoUrl)) {
      return setError("Paste a valid YouTube, Vimeo, Bunny Stream or direct MP4/WebM link (https)");
    }
    if (type === "LIVE" && !/^https:\/\//i.test(liveUrl.trim())) {
      return setError("Enter the live class link (https)");
    }
    if (type === "TEXT" && !content.trim()) return setError("Write the lesson text");

    let startsIso: string | null = null;
    if (type === "LIVE") {
      const d = new Date(liveStartsAt);
      if (!liveStartsAt || Number.isNaN(d.getTime())) return setError("Choose the live class date and time");
      startsIso = d.toISOString();
    }

    let durationMin: number | null = null;
    if (duration.trim() !== "") {
      const n = Number(duration);
      if (!Number.isInteger(n) || n < 0 || n > 1440) return setError("Duration must be whole minutes, up to 1440");
      durationMin = n;
    }

    setSaving(true);
    const err = await onSave({
      title: title.trim(),
      type,
      content,
      videoUrl: videoUrl.trim(),
      liveUrl: liveUrl.trim(),
      liveStartsAt: startsIso,
      durationMin,
      isPreview,
      isPublished,
    });
    setSaving(false);
    if (err) setError(err);
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/30 p-4" noValidate>
      <div>
        <label htmlFor={id("title")} className={LABEL}>Lesson title</label>
        <input
          id={id("title")}
          className={FIELD}
          value={title}
          maxLength={160}
          autoFocus
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <fieldset>
        <legend className={LABEL}>Lesson type</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {TYPES.map((t) => (
            <label
              key={t.value}
              className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-colors ${
                type === t.value ? "border-blue-500 bg-white" : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name={id("type")}
                value={t.value}
                checked={type === t.value}
                onChange={() => setType(t.value)}
                className="mt-0.5 h-4 w-4"
              />
              <span>
                <span className="block text-sm font-medium text-slate-900">{t.label}</span>
                <span className="block text-xs text-slate-500">{t.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {type === "VIDEO" && (
        <div>
          <label htmlFor={id("video")} className={LABEL}>Video link</label>
          <input
            id={id("video")}
            className={FIELD}
            placeholder="https://www.youtube.com/watch?v=..."
            value={videoUrl}
            maxLength={500}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <p className={`mt-1 text-xs ${videoUrl.trim() && !video ? "text-red-600" : "text-slate-500"}`}>
            {!videoUrl.trim()
              ? "YouTube, Vimeo, Bunny Stream, or a direct MP4/WebM link. Always https."
              : video
                ? `Detected: ${PROVIDER_LABEL[video.provider]}`
                : "This link is not supported yet."}
          </p>
        </div>
      )}

      {type === "LIVE" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={id("live")} className={LABEL}>Live class link</label>
            <input
              id={id("live")}
              className={FIELD}
              placeholder="https://meet.google.com/..."
              value={liveUrl}
              maxLength={500}
              onChange={(e) => setLiveUrl(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={id("starts")} className={LABEL}>Starts at</label>
            <input
              id={id("starts")}
              type="datetime-local"
              className={FIELD}
              value={liveStartsAt}
              onChange={(e) => setLiveStartsAt(e.target.value)}
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor={id("content")} className={LABEL}>
          {type === "TEXT" ? "Lesson text" : "Notes (optional)"}
        </label>
        <textarea
          id={id("content")}
          className={FIELD}
          rows={type === "TEXT" ? 8 : 3}
          maxLength={20000}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <p className="mt-1 text-xs text-slate-500">Markdown works: # heading, **bold**, - list</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <div>
          <label htmlFor={id("duration")} className={LABEL}>Duration (minutes)</label>
          <input
            id={id("duration")}
            inputMode="numeric"
            className={FIELD}
            value={duration}
            onChange={(e) => setDuration(e.target.value.replace(/\D/g, "").slice(0, 4))}
          />
        </div>
        <div className="space-y-2 pt-1 sm:pt-6">
          <label className="flex items-center gap-2 text-sm text-slate-800">
            <input type="checkbox" checked={isPreview} onChange={(e) => setIsPreview(e.target.checked)} className="h-4 w-4" />
            Free preview (anyone can watch it)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-800">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4 w-4" />
            Published (students can see it)
          </label>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button disabled={saving} className={PRIMARY_BTN}>
          {saving ? "Saving..." : initial ? "Save lesson" : "Add lesson"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}