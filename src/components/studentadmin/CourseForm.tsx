"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { MODES, slugify } from "@/lib/catalog";
import { FIELD, LABEL, PRIMARY_BTN } from "@/components/studentadmin/ui";
import ImageUpload from "@/components/studentadmin/ImageUpload";

export type CourseInitial = {
  id?: number;
  name: string;
  slug: string;
  summary: string;
  description: string;
  coverImage: string;
  isActive: boolean;
  prices: Record<string, string>;
  categoryId: number | null;
  overview: string;
  eligibility: string;
  keyBenefits: string;
  offerPrice: string;
  offerLabel: string;
  offerEndsAt: string;
};

export type CategoryOption = { id: number; name: string };

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Cleans the link while typing: lowercase, spaces become hyphens, other symbols are dropped.
function cleanSlug(v: string) {
  return v
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-");
}

// A price must be above zero, with at most 2 decimals.
function parsePrice(text: string): number | null {
  const t = text.trim();
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(t)) return null;
  const n = Number(t);
  return n > 0 ? n : null;
}

export default function CourseForm({
  initial,
  categories = [],
}: {
  initial: CourseInitial;
  categories?: CategoryOption[];
}) {
  const router = useRouter();
  const uid = useId();
  const id = (n: string) => `${uid}-${n}`;

  const editing = initial.id !== undefined;
  const initialModes = Object.keys(initial.prices);

  const [f, setF] = useState(initial);
  const [mode, setMode] = useState<string>(initialModes[0] ?? "");
  const [slugTouched, setSlugTouched] = useState(editing && initial.slug !== "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [cats, setCats] = useState<CategoryOption[]>(categories);
  const [newCat, setNewCat] = useState("");
  const [catBusy, setCatBusy] = useState(false);
  const [catError, setCatError] = useState("");

  const hadManyModes = editing && initialModes.length > 1;

  function setName(v: string) {
    setF((p) => ({ ...p, name: v, slug: slugTouched ? p.slug : slugify(v) }));
  }

  async function addCategory() {
    const name = newCat.trim();
    if (name.length < 2) {
      setCatError("Enter the category name");
      return;
    }
    setCatError("");
    setCatBusy(true);
    try {
      const res = await fetch("/api/student-admin/course-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      let data: { id?: number; name?: string; error?: string } | null = null;
      try {
        data = await res.json();
      } catch {
        // The response was not JSON.
      }
      if (!res.ok || typeof data?.id !== "number" || !data.name) {
        setCatError(data?.error ?? "Could not add the category");
        return;
      }
      const created = { id: data.id, name: data.name };
      setCats((p) => [...p, created]);
      setF((p) => ({ ...p, categoryId: created.id }));
      setNewCat("");
    } catch {
      setCatError("Network error. Please try again.");
    } finally {
      setCatBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const name = f.name.trim();
    if (name.length < 3) {
      setError("Enter the course name");
      return;
    }
    if (!SLUG_RE.test(f.slug) || f.slug.length > 80) {
      setError("Link name can have only lowercase letters, numbers and single hyphens");
      return;
    }
    if (!mode) {
      setError("Choose how this course is delivered");
      return;
    }
    const price = parsePrice(f.prices[mode] ?? "");
    if (price === null) {
      setError("Enter a valid price in rupees, above 0 and with up to 2 decimals");
      return;
    }

    let offerPrice: number | null = null;
    if (f.offerPrice.trim() !== "") {
      offerPrice = parsePrice(f.offerPrice);
      if (offerPrice === null) {
        setError("Enter a valid offer price in rupees");
        return;
      }
      if (offerPrice >= price) {
        setError("Offer price must be lower than the normal price");
        return;
      }
    }

    if (hadManyModes && !confirm("This course is sold in more than one mode. Saving keeps only the selected mode. Continue?")) {
      return;
    }
    if (editing && f.slug !== initial.slug && !confirm("Changing the link name breaks old links to this course. Continue?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(editing ? `/api/student-admin/courses/${initial.id}` : "/api/student-admin/courses", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          name,
          slug: f.slug,
          summary: f.summary,
          description: f.description,
          coverImage: f.coverImage,
          isActive: f.isActive,
          categoryId: f.categoryId,
          overview: f.overview,
          eligibility: f.eligibility,
          keyBenefits: f.keyBenefits,
          offerPrice,
          offerLabel: f.offerLabel,
          offerEndsAt: f.offerEndsAt,
          prices: [{ mode, price }],
        }),
      });
      let data: { error?: string } | null = null;
      try {
        data = await res.json();
      } catch {
        // The response was not JSON.
      }
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong");
        return;
      }
      router.push("/student-admin/courses");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this course permanently? If it already has orders, deactivate it instead.")) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/student-admin/courses/${initial.id}`, { method: "DELETE" });
      if (!res.ok) {
        let data: { error?: string } | null = null;
        try {
          data = await res.json();
        } catch {
          // The response was not JSON.
        }
        setError(data?.error ?? "Could not delete. If students have bought this course, deactivate it instead.");
        return;
      }
      router.push("/student-admin/courses");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Course details</h2>

            <div>
              <label htmlFor={id("name")} className={LABEL}>Course name</label>
              <input
                id={id("name")}
                className={FIELD}
                value={f.name}
                maxLength={120}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor={id("slug")} className={LABEL}>Link name</label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-white focus-within:border-blue-400">
                <span className="pl-3 text-sm text-slate-400">/courses/</span>
                <input
                  id={id("slug")}
                  className="w-full rounded-xl bg-transparent p-2.5 text-sm outline-none"
                  value={f.slug}
                  maxLength={80}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setF({ ...f, slug: cleanSlug(e.target.value) });
                  }}
                  onBlur={() => setF((p) => ({ ...p, slug: p.slug.replace(/^-+|-+$/g, "") }))}
                  required
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Made from the course name. Letters, numbers and hyphens only.
                {editing && " Changing it later breaks old links to this course."}
              </p>
            </div>

            <div>
              <label htmlFor={id("summary")} className={LABEL}>Short summary</label>
              <textarea
                id={id("summary")}
                className={FIELD}
                rows={2}
                maxLength={300}
                value={f.summary}
                onChange={(e) => setF({ ...f, summary: e.target.value })}
              />
              <p className="mt-1 text-xs text-slate-500">{f.summary.length}/300, shown on course cards</p>
            </div>

            <div>
              <label htmlFor={id("description")} className={LABEL}>Full description</label>
              <textarea
                id={id("description")}
                className={`${FIELD} font-mono`}
                rows={12}
                maxLength={20000}
                value={f.description}
                onChange={(e) => setF({ ...f, description: e.target.value })}
              />
              <p className="mt-1 text-xs text-slate-500">Markdown works: # heading, **bold**, - list, [link](https://...)</p>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">More details tabs</h2>
              <p className="text-xs text-slate-500">
                These show as the Overview, Eligibility and Key Benefits tabs on the course page. A tab with no
                content is hidden.
              </p>
            </div>

            <div>
              <label htmlFor={id("overview")} className={LABEL}>Overview</label>
              <textarea
                id={id("overview")}
                className={`${FIELD} font-mono`}
                rows={10}
                maxLength={20000}
                value={f.overview}
                onChange={(e) => setF({ ...f, overview: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor={id("eligibility")} className={LABEL}>Eligibility</label>
              <textarea
                id={id("eligibility")}
                className={`${FIELD} font-mono`}
                rows={8}
                maxLength={20000}
                value={f.eligibility}
                onChange={(e) => setF({ ...f, eligibility: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor={id("keyBenefits")} className={LABEL}>Key Benefits</label>
              <textarea
                id={id("keyBenefits")}
                className={`${FIELD} font-mono`}
                rows={8}
                maxLength={20000}
                value={f.keyBenefits}
                onChange={(e) => setF({ ...f, keyBenefits: e.target.value })}
              />
              <p className="mt-1 text-xs text-slate-500">Markdown works: # heading, **bold**, - list, [link](https://...)</p>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Category</h2>
            <p className="text-xs text-slate-500">Decides where the course appears in the All Courses menu.</p>

            <select
              aria-label="Course category"
              className={`${FIELD} mt-3`}
              value={f.categoryId ?? ""}
              onChange={(e) => setF({ ...f, categoryId: e.target.value === "" ? null : Number(e.target.value) })}
            >
              <option value="">No category</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="mt-3 flex gap-2">
              <input
                aria-label="New category name"
                className={FIELD}
                placeholder="New category, e.g. Banking Exam"
                maxLength={120}
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCategory();
                  }
                }}
              />
              <button
                type="button"
                disabled={catBusy}
                onClick={addCategory}
                className="shrink-0 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {catBusy ? "Adding..." : "Add"}
              </button>
            </div>
            {catError && (
              <p role="alert" className="mt-2 text-xs text-red-600">
                {catError}
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Cover image</h2>
            <div className="mt-3">
              <ImageUpload value={f.coverImage} onChange={(url) => setF((p) => ({ ...p, coverImage: url }))} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <fieldset>
              <legend className="text-lg font-semibold text-slate-900">Delivery mode and price</legend>
              <p className="text-xs text-slate-500">Choose one mode and enter its price in rupees.</p>

              {hadManyModes && (
                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-slate-700">
                  This course is currently sold in {initialModes.length} modes. Saving keeps only the mode selected
                  below.
                </p>
              )}

              <div className="mt-3 space-y-2">
                {MODES.map((m) => {
                  const on = mode === m.value;
                  return (
                    <label
                      key={m.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 transition-colors ${
                        on ? "border-blue-500 bg-blue-50/50" : "border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={id("mode")}
                        value={m.value}
                        checked={on}
                        onChange={() => setMode(m.value)}
                        className="h-4 w-4"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">{m.label}</p>
                        <p className="text-xs text-slate-500">{m.hint}</p>
                      </div>
                      <div className="relative w-28">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">₹</span>
                        <input
                          disabled={!on}
                          inputMode="decimal"
                          aria-label={`Price for ${m.label}`}
                          value={f.prices[m.value] ?? ""}
                          onChange={(e) =>
                            setF({ ...f, prices: { ...f.prices, [m.value]: e.target.value.replace(/[^\d.]/g, "") } })
                          }
                          className="w-full rounded-lg border border-slate-200 py-2 pl-6 pr-2 text-right text-sm outline-none focus:border-blue-400 disabled:bg-slate-50"
                        />
                      </div>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Offer (optional)</h2>
            <p className="text-xs text-slate-500">
              Leave the offer price empty for no offer. The offer ends automatically after the end date.
            </p>

            <div className="mt-3 space-y-3">
              <div>
                <label htmlFor={id("offerPrice")} className={LABEL}>Offer price (₹)</label>
                <input
                  id={id("offerPrice")}
                  inputMode="decimal"
                  className={FIELD}
                  value={f.offerPrice}
                  onChange={(e) => setF({ ...f, offerPrice: e.target.value.replace(/[^\d.]/g, "") })}
                />
              </div>
              <div>
                <label htmlFor={id("offerLabel")} className={LABEL}>Offer label</label>
                <input
                  id={id("offerLabel")}
                  className={FIELD}
                  placeholder="e.g. Diwali Offer"
                  maxLength={80}
                  value={f.offerLabel}
                  onChange={(e) => setF({ ...f, offerLabel: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor={id("offerEndsAt")} className={LABEL}>Offer ends on</label>
                <input
                  id={id("offerEndsAt")}
                  type="date"
                  className={FIELD}
                  value={f.offerEndsAt}
                  onChange={(e) => setF({ ...f, offerEndsAt: e.target.value })}
                />
                <p className="mt-1 text-xs text-slate-500">Empty means the offer has no end date.</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={f.isActive}
                onChange={(e) => setF({ ...f, isActive: e.target.checked })}
                className="mt-1 h-4 w-4"
              />
              <span>
                <span className="block text-sm font-medium text-slate-900">Active</span>
                <span className="block text-xs text-slate-500">Inactive courses are hidden from the website.</span>
              </span>
            </label>
          </section>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button disabled={loading} className={PRIMARY_BTN}>
          {loading ? "Saving..." : editing ? "Save changes" : "Create course"}
        </button>
        <Link href="/student-admin/courses" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm hover:bg-slate-50">
          Cancel
        </Link>
        {editing && (
          <button
            type="button"
            disabled={loading}
            onClick={remove}
            className="ml-auto rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            Delete course
          </button>
        )}
      </div>
    </form>
  );
}