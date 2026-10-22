import Link from "next/link";
import { Suspense } from "react";
import { FileText, ImageOff, Newspaper, PenLine, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStudentAdmin } from "@/lib/sadmin-auth";
import { Card, Empty, PRIMARY_BTN, Pill, SAHeader, StatCard, TH, THEAD, fmtDate } from "@/components/studentadmin/ui";

async function View() {
  await requireStudentAdmin();

  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
    },
  });
  const published = posts.filter((p) => p.status === "PUBLISHED").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Posts" value={String(posts.length)} sub="All posts" icon={Newspaper} tone="blue" />
        <StatCard label="Published" value={String(published)} sub="Live on the website" icon={FileText} tone="green" />
        <StatCard label="Drafts" value={String(posts.length - published)} sub="Not live yet" icon={PenLine} tone="orange" />
      </div>

      <Card title="All posts" badge={`${posts.length} total`}>
        {posts.length === 0 ? (
          <Empty title="No posts yet." text="Write your first blog post. Drafts stay private until you publish them." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={THEAD}>
                <tr>
                  <th className="px-5 py-3 font-semibold">Post</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Published</th>
                  <th className={TH}>Updated</th>
                  <th className={TH}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {p.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.coverImage}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="h-12 w-16 shrink-0 rounded-lg border border-slate-100 object-cover"
                          />
                        ) : (
                          <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                            <ImageOff className="h-5 w-5" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">{p.title}</p>
                          <p className="font-mono text-xs text-slate-500">/blog/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Pill cls={p.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}>
                        {p.status === "PUBLISHED" ? "Published" : "Draft"}
                      </Pill>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      {p.publishedAt ? fmtDate.format(p.publishedAt) : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-500">{fmtDate.format(p.updatedAt)}</td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/student-admin/blog/${p.id}`}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function BlogPage() {
  return (
    <div className="space-y-6">
      <SAHeader
        title="Blog"
        subtitle="Write and publish posts for the website."
        action={
          <Link href="/student-admin/blog/new" className={PRIMARY_BTN}>
            <Plus className="h-4 w-4" />
            New post
          </Link>
        }
      />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View />
      </Suspense>
    </div>
  );
}