import Link from "next/link";
import { Suspense } from "react";
import { BookOpen, CheckCircle2, EyeOff, ImageOff, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStudentAdmin } from "@/lib/sadmin-auth";
import { MODE_LABEL, effectivePrices } from "@/lib/catalog";
import StatusToggleButton from "@/components/studentadmin/StatusToggleButton";
import { Card, Empty, PRIMARY_BTN, Pill, SAHeader, StatCard, TH, THEAD, inr0 } from "@/components/studentadmin/ui";

async function View() {
  await requireStudentAdmin();

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: { prices: true, _count: { select: { orders: true } } },
  });
  const active = courses.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Courses" value={String(courses.length)} sub="All courses" icon={BookOpen} tone="blue" />
        <StatCard label="Active" value={String(active)} sub="Visible on the website" icon={CheckCircle2} tone="green" />
        <StatCard label="Inactive" value={String(courses.length - active)} sub="Hidden" icon={EyeOff} tone="orange" />
      </div>

      <Card title="All courses" badge={`${courses.length} total`}>
        {courses.length === 0 ? (
          <Empty title="No courses yet." text="Add your first course. It will show on the website and in checkout." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={THEAD}>
                <tr>
                  <th className="px-5 py-3 font-semibold">Course</th>
                  <th className={TH}>Modes and price</th>
                  <th className={`${TH} text-right`}>Orders</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => {
                  const prices = effectivePrices(c);
                  const low = prices[0].price;
                  const high = prices[prices.length - 1].price;
                  return (
                    <tr key={c.id} className="border-t border-slate-100 align-top hover:bg-slate-50/60">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {c.coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={c.coverImage}
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
                            <p className="font-semibold text-slate-900">{c.name}</p>
                            {c.slug ? (
                              <p className="font-mono text-xs text-slate-500">/courses/{c.slug}</p>
                            ) : (
                              <p className="text-xs text-amber-700">No link name yet, open it and save</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-mono lining-nums text-slate-900">
                          {low === high ? inr0.format(low) : `${inr0.format(low)} to ${inr0.format(high)}`}
                        </p>
                        <p className="max-w-[16rem] text-xs text-slate-500">
                          {prices.map((p) => MODE_LABEL[p.mode]).join(", ")}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-right lining-nums">{c._count.orders}</td>
                      <td className="px-4 py-4">
                        <Pill cls={c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}>
                          {c.isActive ? "Active" : "Inactive"}
                        </Pill>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap items-start gap-2">
                          <Link
                            href={`/student-admin/courses/${c.id}`}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                          >
                            Edit
                          </Link>
                          <StatusToggleButton url={`/api/student-admin/courses/${c.id}`} active={c.isActive} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <SAHeader
        title="Courses"
        subtitle="Add and edit courses. Changes show on the whole site."
        action={
          <Link href="/student-admin/courses/new" className={PRIMARY_BTN}>
            <Plus className="h-4 w-4" />
            Add course
          </Link>
        }
      />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View />
      </Suspense>
    </div>
  );
}