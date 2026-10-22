"use client";

import { useRef, useState } from "react";

const MAX_BYTES = 2 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUpload({
  value,
  onChange,
  alt = "Course cover",
}: {
  value: string;
  onChange: (url: string) => void;
  alt?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(file?: File) {
    if (!file) return;
    setError("");

    if (!TYPES.includes(file.type)) {
      setError("Only JPG, PNG or WebP images are allowed");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be under 2 MB");
      return;
    }

    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/student-admin/upload", { method: "POST", body });

      let data: { url?: string; error?: string } | null = null;
      try {
        data = await res.json();
      } catch {
        // The response was not JSON.
      }
      if (!res.ok || !data?.url) {
        setError(data?.error ?? "Upload failed");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
      // Lets the same file be chosen again after an error.
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt={alt}
          className="aspect-video w-full rounded-xl border border-slate-200 object-cover"
        />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
          No image yet
        </div>
      )}

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label="Upload cover image"
        onChange={(e) => pick(e.target.files?.[0])}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? "Uploading..." : value ? "Replace image" : "Upload image"}
        </button>
        {value && !busy && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Remove
          </button>
        )}
      </div>

      <p className="text-xs text-slate-500">JPG, PNG or WebP, up to 2 MB. Best size 1280 × 720.</p>

      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}