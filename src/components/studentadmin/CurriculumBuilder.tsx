"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, FileText, Layers, Pencil, Plus, Radio, Trash2, Video } from "lucide-react";
import LessonForm, { type LessonPayload } from "@/components/studentadmin/LessonForm";
import TopicForm from "@/components/studentadmin/TopicForm";
import { LESSON_TYPE_LABEL, formatMinutes, type LessonDTO, type TopicDTO } from "@/lib/curriculum";

const liveFmt = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

function IconBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        danger ? "text-red-600 hover:bg-red-50" : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function TypeIcon({ type }: { type: LessonDTO["type"] }) {
  const cls = "h-4 w-4";
  if (type === "VIDEO") return <Video className={cls} />;
  if (type === "LIVE") return <Radio className={cls} />;
  return <FileText className={cls} />;
}

export default function CurriculumBuilder({ courseId, topics }: { courseId: number; topics: TopicDTO[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [topicForm, setTopicForm] = useState<null | { id?: number }>(null);
  const [lessonForm, setLessonForm] = useState<null | { topicId: number; lessonId?: number }>(null);

  const disabled = busy || pending;
  const totalLessons = topics.reduce((a, t) => a + t.lessons.length, 0);
  const totalMinutes = topics.reduce((a, t) => a + t.lessons.reduce((b, l) => b + (l.durationMin ?? 0), 0), 0);

  // Sends one change to the server. Returns an error message, or null when it worked.
  async function run(body: Record<string, unknown>): Promise<string | null> {
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`/api/student-admin/courses/${courseId}/curriculum`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        let message = "Something went wrong";
        try {
          const data = await res.json();
          message = data.error ?? message;
        } catch {
          // The response was not JSON.
        }
        return message;
      }
      startTransition(() => router.refresh());
      return null;
    } catch {
      return "Network error. Please try again.";
    } finally {
      setBusy(false);
    }
  }

  async function quick(body: Record<string, unknown>) {
    const err = await run(body);
    if (err) setError(err);
  }

  function toggle(id: number) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openTopicForm(id?: number) {
    setLessonForm(null);
    setTopicForm({ id });
  }
  function openLessonForm(topicId: number, lessonId?: number) {
    setTopicForm(null);
    setLessonForm({ topicId, lessonId });
  }

  async function saveTopic(v: { title: string; summary: string }) {
    const err = await run(
      topicForm?.id ? { action: "topic.update", topicId: topicForm.id, ...v } : { action: "topic.create", ...v },
    );
    if (!err) setTopicForm(null);
    return err;
  }

  async function saveLesson(topicId: number, lessonId: number | undefined, v: LessonPayload) {
    const err = await run(
      lessonId ? { action: "lesson.update", lessonId, ...v } : { action: "lesson.create", topicId, ...v },
    );
    if (!err) setLessonForm(null);
    return err;
  }

  function removeTopic(t: TopicDTO) {
    const extra = t.lessons.length ? ` and its ${t.lessons.length} lesson${t.lessons.length > 1 ? "s" : ""}` : "";
    if (confirm(`Delete the topic "${t.title}"${extra}? This cannot be undone.`)) {
      quick({ action: "topic.delete", topicId: t.id });
    }
  }

  function removeLesson(l: LessonDTO) {
    if (confirm(`Delete the lesson "${l.title}"? This cannot be undone.`)) {
      quick({ action: "lesson.delete", lessonId: l.id });
    }
  }

  const addTopicOpen = topicForm !== null && topicForm.id === undefined;

  return (
    <div className="space-y-4">
      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      {topics.length === 0 && !addTopicOpen ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Layers className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Start building your course!</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            Add topics, then add video, text and live class lessons inside each topic.
          </p>
          <button
            type="button"
            onClick={() => openTopicForm()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Topic
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            {topics.length} topic{topics.length === 1 ? "" : "s"} · {totalLessons} lesson
            {totalLessons === 1 ? "" : "s"} · {formatMinutes(totalMinutes)}
            {pending && <span className="ml-2 text-xs text-slate-400">Updating...</span>}
          </p>
          <button
            type="button"
            onClick={() => openTopicForm()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Topic
          </button>
        </div>
      )}

      {topics.map((t, ti) => {
        const open = !collapsed.has(t.id);
        const minutes = t.lessons.reduce((a, l) => a + (l.durationMin ?? 0), 0);
        const editingTopic = topicForm?.id === t.id;
        const addingLesson = lessonForm?.topicId === t.id && lessonForm.lessonId === undefined;

        return (
          <section key={t.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="flex items-center gap-1 px-3 py-2.5">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => toggle(t.id)}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-slate-50"
              >
                <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "" : "-rotate-90"}`} />
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-900">{t.title}</span>
                  <span className="block text-xs text-slate-500">
                    {t.lessons.length} lesson{t.lessons.length === 1 ? "" : "s"} · {formatMinutes(minutes)}
                  </span>
                </span>
              </button>
              <IconBtn label="Move topic up" disabled={disabled || ti === 0} onClick={() => quick({ action: "topic.move", topicId: t.id, direction: "up" })}>
                <ChevronUp className="h-4 w-4" />
              </IconBtn>
              <IconBtn label="Move topic down" disabled={disabled || ti === topics.length - 1} onClick={() => quick({ action: "topic.move", topicId: t.id, direction: "down" })}>
                <ChevronDown className="h-4 w-4" />
              </IconBtn>
              <IconBtn label="Edit topic" disabled={disabled} onClick={() => openTopicForm(t.id)}>
                <Pencil className="h-4 w-4" />
              </IconBtn>
              <IconBtn label="Delete topic" danger disabled={disabled} onClick={() => removeTopic(t)}>
                <Trash2 className="h-4 w-4" />
              </IconBtn>
            </header>

            {editingTopic && (
              <div className="border-t border-slate-100 px-4 py-4">
                <TopicForm
                  initial={{ title: t.title, summary: t.summary }}
                  onSave={saveTopic}
                  onCancel={() => setTopicForm(null)}
                />
              </div>
            )}

            {open && (
              <div className="border-t border-slate-100">
                {t.lessons.length === 0 && !addingLesson && (
                  <p className="px-5 py-5 text-sm text-slate-500">No lessons in this topic yet.</p>
                )}

                <ul className="divide-y divide-slate-100">
                  {t.lessons.map((l, li) =>
                    lessonForm?.lessonId === l.id ? (
                      <li key={l.id} className="px-4 py-4">
                        <LessonForm
                          initial={l}
                          onSave={(v) => saveLesson(t.id, l.id, v)}
                          onCancel={() => setLessonForm(null)}
                        />
                      </li>
                    ) : (
                      <li key={l.id} className="flex items-center gap-3 px-4 py-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <TypeIcon type={l.type} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">{l.title}</p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                            <span>{LESSON_TYPE_LABEL[l.type]}</span>
                            {l.durationMin ? <span>· {formatMinutes(l.durationMin)}</span> : null}
                            {l.type === "LIVE" && l.liveStartsAt && <span>· {liveFmt.format(new Date(l.liveStartsAt))}</span>}
                            {l.isPreview && (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                                Free preview
                              </span>
                            )}
                            {!l.isPublished && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                                Draft
                              </span>
                            )}
                          </div>
                        </div>
                        <IconBtn label="Move lesson up" disabled={disabled || li === 0} onClick={() => quick({ action: "lesson.move", lessonId: l.id, direction: "up" })}>
                          <ChevronUp className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn label="Move lesson down" disabled={disabled || li === t.lessons.length - 1} onClick={() => quick({ action: "lesson.move", lessonId: l.id, direction: "down" })}>
                          <ChevronDown className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn label="Edit lesson" disabled={disabled} onClick={() => openLessonForm(t.id, l.id)}>
                          <Pencil className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn label="Delete lesson" danger disabled={disabled} onClick={() => removeLesson(l)}>
                          <Trash2 className="h-4 w-4" />
                        </IconBtn>
                      </li>
                    ),
                  )}
                </ul>

                <div className="border-t border-slate-100 px-4 py-3">
                  {addingLesson ? (
                    <LessonForm onSave={(v) => saveLesson(t.id, undefined, v)} onCancel={() => setLessonForm(null)} />
                  ) : (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => openLessonForm(t.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                      Add Lesson
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        );
      })}

      {addTopicOpen && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">New topic</h2>
          <TopicForm onSave={saveTopic} onCancel={() => setTopicForm(null)} />
        </div>
      )}
    </div>
  );
}