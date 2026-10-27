"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Trash2, Upload } from "lucide-react";

type FileRow = { id: number; name: string; sizeBytes: number };

function size(n: number) {
  return n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
}

export default function LessonFiles({ lessonId }: { lessonId: number }) {
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetch(`/api/student-admin/lesson-files?lessonId=${lessonId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.files) setFiles(d.files);
      })
      .catch(() => {})
      .finally(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, [lessonId]);

  async function upload(file?: File) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const body = new FormData();
      body.append("lessonId", String(lessonId));
      body.append("file", file);
      const res = await fetch("/api/student-admin/lesson-files", { method: "POST", body });
      let data: { file?: FileRow; error?: string } | null = null;
      try {
        data = await res.json();
      } catch {
        // The response was not JSON.
      }
      if (!res.ok || !data?.file) {
        setError(data?.error ?? "Upload failed");
        return;
      }
      setFiles((p) => [...p, data.file as FileRow]);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function remove(f: FileRow) {
    if (!confirm(`Remove "${f.name}"? Students will no longer be able to download it.`)) return;
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`/api/student-admin/lesson-files/${f.id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Could not remove the file");
        return;
      }
      setFiles((p) => p.filter((x) => x.id !== f.id));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Attach files</p>

      {loaded && files.length === 0 && <p className="text-xs text-slate-500">No files attached yet.</p>}

      {files.length > 0 && (
        <ul className="divide-y divide-slate-100">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-2 py-2 text-sm">
              <FileText className="h-4 w-4 shrink-0 text-blue-600" />
              <span className="min-w-0 flex-1 truncate text-slate-800">{f.name}</span>
              <span className="text-xs text-slate-400">{size(f.sizeBytes)}</span>
              <button
                type="button"
                disabled={busy}
                onClick={() => remove(f)}
                aria-label={`Remove ${f.name}`}
                className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={input}
        type="file"
        accept=".pdf,.docx,.pptx,.xlsx"
        className="sr-only"
        aria-label="Upload a file"
        onChange={(e) => upload(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        <Upload className="h-4 w-4" />
        {busy ? "Please wait..." : "Upload PDF or file"}
      </button>
      <p className="text-xs text-slate-500">PDF, DOCX, PPTX or XLSX, up to 10 MB each. Files upload straight away.</p>

      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}