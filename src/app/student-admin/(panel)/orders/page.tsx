import Link from "next/link";
import { Suspense } from "react";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireStudentAdmin } from "@/lib/sadmin-auth";
import { MODE_LABEL } from "@/lib/catalog";
import {
  Avatar,
  Card,
  Chip,
  Empty,
  ORDER_PILL,
  Pager,
  Pill,
  SAHeader,
  TH,
  THEAD,
  fmtDate,
  inr,
  qs,
} from "@/components/studentadmin/ui";

const PAGE_SIZE = 25;
const STATUSES: OrderStatus[] = ["PAID", "PENDING", "FAILED", "REFUNDED"];

type SearchParams = Promise<{ status?: string; page?: string }>;

async function View({ searchParams }: { searchParams: SearchParams }) {
  await requireStudentAdmin();

  const sp = await searchParams;
  const status = STATUSES.find((s) => s === sp.status);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const where = status ? { status } : {};

  const [orders, total, grouped] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        student: { select: { id: true, name: true } },
        course: { select: { name: true, mode: true } },
        partner: { select: { name: true } },
      },
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const counts: Record<string, number> = {};
  for (const g of grouped) counts[g.status] = g._count._all;
  const all = Object.values(counts).reduce((a, b) => a + b, 0);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Chip href="/student-admin/orders" active={!status}>
          All <span className="opacity-70">({all})</span>
        </Chip>
        {STATUSES.map((s) => (
          <Chip key={s} href={qs("/student-admin/orders", { status: s })} active={status === s}>
            {ORDER_PILL[s].label} <span className="opacity-70">({counts[s] ?? 0})</span>
          </Chip>
        ))}
      </div>

      <Card title="Orders" badge={`${total} ${status ? "shown" : "total"}`}>
        {orders.length === 0 ? (
          <Empty title="No orders found." text="Orders appear here as students buy courses." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={THEAD}>
                <tr>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className={TH}>Student</th>
                  <th className={TH}>Course</th>
                  <th className={TH}>Partner</th>
                  <th className={`${TH} text-right`}>Amount</th>
                  <th className={TH}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-slate-100 align-top hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <p className="font-mono">#{o.id}</p>
                      <p className="text-xs text-slate-400">{fmtDate.format(o.createdAt)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/student-admin/students/${o.student.id}`} className="flex items-center gap-3 hover:underline">
                        <Avatar name={o.student.name} />
                        <span className="font-medium text-slate-900">{o.student.name}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-slate-800">{o.course.name}</p>
                      <p className="text-xs text-slate-500">{MODE_LABEL[o.mode ?? o.course.mode]}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{o.partner?.name ?? "Direct"}</td>
                    <td className="px-4 py-4 text-right font-mono lining-nums">{inr.format(Number(o.amount))}</td>
                    <td className="px-4 py-4">
                      <Pill cls={ORDER_PILL[o.status].cls}>{ORDER_PILL[o.status].label}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pager base="/student-admin/orders" params={{ status }} page={page} pages={pages} />
    </div>
  );
}

export default function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="space-y-6">
      <SAHeader title="Orders" subtitle="Every course purchase. Payment and refunds are added with checkout." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View searchParams={searchParams} />
      </Suspense>
    </div>
  );
}