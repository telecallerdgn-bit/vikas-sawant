"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { slugify } from "@/lib/catalog";
import { FIELD, LABEL, PRIMARY_BTN } from "@/components/studentadmin/ui";
import ImageUpload from "@/components/studentadmin/ImageUpload";

export type BlogInitial = {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  status: "DRAFT" | "PUBLISHED";
};

export default function BlogForm({ initial }: { initial: BlogInitial }) {
  const router = useRouter();
  const editing = initial.id !== undefined;
  const [f, setF] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(editing && initial.slug !== "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(editing ? `/api/student-admin/blog/${initial.id}` : "/api/student-admin/blog", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push("/student-admin/blog");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this post permanently?")) return;
    setError("");
    setLoading(true);
    const res = await fetch(`/api/student-admin/blog/${initial.id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not delete");
      return;
    }
    router.push("/student-admin/blog");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div>
            <label className={LABEL}>Title</label>
            <input
              className={FIELD}
              value={f.title}
              onChange={(e) =>
                setF({ ...f, title: e.target.value, slug: slugTouched ? f.slug : slugify(e.target.value) })
              }
              required
            />
          </div>

          <div>
            <label className={LABEL}>Content</label>
            <textarea
              className={`${FIELD} font-mono`}
              rows={22}
              value={f.content}
              onChange={(e) => setF({ ...f, content: e.target.value })}
            />
            <p className="mt-1 text-xs text-slate-500">
              Markdown: # Heading, ## Sub heading, **bold**, *italic*, - list item, [text](https://link),
              ![alt text](https://image-link)
            </p>
          </div>
        </section>

        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
            <div>
              <label className={LABEL}>Status</label>
              <select
                className={FIELD}
                value={f.status}
                onChange={(e) => setF({ ...f, status: e.target.value as "DRAFT" | "PUBLISHED" })}
              >
                <option value="DRAFT">Draft (only you can see it)</option>
                <option value="PUBLISHED">Published (live on the website)</option>
              </select>
            </div>

            <div>
              <label className={LABEL}>Link name</label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-white focus-within:border-blue-400">
                <span className="pl-3 text-sm text-slate-400">/blog/</span>
                <input
                  className="w-full rounded-xl bg-transparent p-2.5 text-sm outline-none"
                  value={f.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setF({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") });
                  }}
                  onBlur={() => setF((p) => ({ ...p, slug: slugify(p.slug) }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className={LABEL}>Excerpt</label>
              <textarea
                className={FIELD}
                rows={3}
                maxLength={300}
                value={f.excerpt}
                onChange={(e) => setF({ ...f, excerpt: e.target.value })}
              />
              <p className="mt-1 text-xs text-slate-500">{f.excerpt.length}/300, shown on the blog list</p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Cover image</h2>
            <div className="mt-3">
              <ImageUpload
                value={f.coverImage}
                onChange={(url) => setF({ ...f, coverImage: url })}
                alt="Blog cover"
              />
            </div>
          </section>
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button disabled={loading} className={PRIMARY_BTN}>
          {loading ? "Saving..." : editing ? "Save changes" : "Create post"}
        </button>
        <Link href="/student-admin/blog" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm hover:bg-slate-50">
          Cancel
        </Link>
        {editing && (
          <button
            type="button"
            disabled={loading}
            onClick={remove}
            className="ml-auto rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            Delete post
          </button>
        )}
      </div>
    </form>
  );
}