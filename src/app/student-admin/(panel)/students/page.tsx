import Link from "next/link";
import { Suspense } from "react";
import type { Prisma } from "@prisma/client";
import { GraduationCap, Search, UserCheck, UserX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStudentAdmin } from "@/lib/sadmin-auth";
import {
  Avatar,
  Card,
  Chip,
  Empty,
  Pager,
  Pill,
  SAHeader,
  StatCard,
  TH,
  THEAD,
  fmtDate,
  qs,
} from "@/components/studentadmin/ui";

const PAGE_SIZE = 25;

type SearchParams = Promise<{ q?: string; status?: string; page?: string }>;

async function View({ searchParams }: { searchParams: SearchParams }) {
  await requireStudentAdmin();

  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 60);
  const status = sp.status === "active" || sp.status === "disabled" ? sp.status : undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const where: Prisma.StudentWhereInput = {
    ...(q ? { OR: [{ name: { contains: q } }, { mobile: { contains: q } }, { email: { contains: q } }] } : {}),
    ...(status ? { isActive: status === "active" } : {}),
  };

  const [students, total, all, disabled] = await Promise.all([
    prisma.student.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { partner: { select: { name: true } }, _count: { select: { orders: true } } },
    }),
    prisma.student.count({ where }),
    prisma.student.count(),
    prisma.student.count({ where: { isActive: false } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Students" value={String(all)} sub="All registered" icon={GraduationCap} tone="purple" />
        <StatCard label="Active" value={String(all - disabled)} sub="Can log in" icon={UserCheck} tone="green" />
        <StatCard label="Disabled" value={String(disabled)} sub="Cannot log in" icon={UserX} tone="rose" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <form className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, mobile or email"
            className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
          />
          {status && <input type="hidden" name="status" value={status} />}
        </form>

        <div className="flex gap-2">
          <Chip href={qs("/student-admin/students", { q })} active={!status}>All</Chip>
          <Chip href={qs("/student-admin/students", { q, status: "active" })} active={status === "active"}>Active</Chip>
          <Chip href={qs("/student-admin/students", { q, status: "disabled" })} active={status === "disabled"}>Disabled</Chip>
        </div>
      </div>

      <Card title="Students" badge={`${total} ${q || status ? "found" : "total"}`}>
        {students.length === 0 ? (
          <Empty
            title={q || status ? "No students match." : "No students yet."}
            text={q || status ? "Try a different search or filter." : "Students appear here when they register."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={THEAD}>
                <tr>
                  <th className="px-5 py-3 font-semibold">Student</th>
                  <th className={TH}>Contact</th>
                  <th className={TH}>Partner</th>
                  <th className={`${TH} text-right`}>Orders</th>
                  <th className={TH}>Status</th>
                  <th className={TH}></th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} />
                        <div>
                          <p className="font-semibold text-slate-900">{s.name}</p>
                          <p className="text-xs text-slate-400">Joined {fmtDate.format(s.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-slate-800">{s.mobile}</p>
                      <p className="break-all text-xs text-slate-500">{s.email ?? "No email"}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{s.partner?.name ?? "Direct"}</td>
                    <td className="px-4 py-4 text-right lining-nums">{s._count.orders}</td>
                    <td className="px-4 py-4">
                      <Pill cls={s.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                        {s.isActive ? "Active" : "Disabled"}
                      </Pill>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/student-admin/students/${s.id}`}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                      >
                        View and edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pager base="/student-admin/students" params={{ q, status }} page={page} pages={pages} />
    </div>
  );
}

export default function StudentsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="space-y-6">
      <SAHeader title="Students" subtitle="Everyone who registered on the website. Open a student to edit details." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View searchParams={searchParams} />
      </Suspense>
    </div>
  );
}