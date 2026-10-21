import Link from "next/link";
import { Suspense } from "react";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSubSuper } from "@/lib/subsuper";
import {
  Avatar,
  Card,
  Empty,
  MODE_LABEL,
  ORDER_PILL,
  PageHeader,
  Pill,
  THEAD,
  TH,
  fmtDate,
  inr,
} from "@/components/subsuper/ui";

const PAGE_SIZE = 25;
const STATUSES: OrderStatus[] = ["PAID", "PENDING", "FAILED", "REFUNDED"];

type SearchParams = Promise<{ status?: string; page?: string }>;

function href(status?: string, page?: number) {
  const q = new URLSearchParams();
  if (status) q.set("status", status);
  if (page && page > 1) q.set("page", String(page));
  const s = q.toString();
  return `/sub-super/orders${s ? `?${s}` : ""}`;
}

async function View({ searchParams }: { searchParams: SearchParams }) {
  await requireSubSuper();

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
        student: { select: { name: true } },
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

  const tabs = [
    { label: "All", value: undefined as string | undefined, count: all },
    ...STATUSES.map((s) => ({ label: ORDER_PILL[s].label, value: s as string | undefined, count: counts[s] ?? 0 })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = (t.value ?? "") === (status ?? "");
          return (
            <Link
              key={t.label}
              href={href(t.value)}
              className={`rounded-full border px-3 py-1 text-sm ${
                active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {t.label} <span className="opacity-70">({t.count})</span>
            </Link>
          );
        })}
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
                      <div className="flex items-center gap-3">
                        <Avatar name={o.student.name} />
                        <span className="font-medium text-slate-900">{o.student.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-slate-800">{o.course.name}</p>
                      <p className="text-xs text-slate-500">{MODE_LABEL[o.course.mode]}</p>
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

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={href(status, page - 1)} className="rounded border border-slate-200 bg-white px-3 py-1 hover:bg-slate-50">
                Previous
              </Link>
            )}
            {page < pages && (
              <Link href={href(status, page + 1)} className="rounded border border-slate-200 bg-white px-3 py-1 hover:bg-slate-50">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Orders" subtitle="Every course purchase. Read-only." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View searchParams={searchParams} />
      </Suspense>
    </div>
  );
}