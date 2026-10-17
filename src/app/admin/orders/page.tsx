import Link from "next/link";
import { Suspense } from "react";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;
const STATUSES = Object.values(OrderStatus);

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});
const dateFmt = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-200 text-gray-700",
};

// Reads the first non-empty text field from an object, so we do not depend on exact field names.
function pickLabel(obj: unknown, keys: string[], fallback = "-"): string {
  if (obj && typeof obj === "object") {
    const rec = obj as Record<string, unknown>;
    for (const k of keys) {
      const v = rec[k];
      if (typeof v === "string" && v.trim()) return v;
    }
  }
  return fallback;
}

function href(status?: string, page?: number) {
  const q = new URLSearchParams();
  if (status) q.set("status", status);
  if (page && page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `/admin/orders?${s}` : "/admin/orders";
}

type SearchParams = Promise<{ status?: string; page?: string }>;

async function OrdersView({ searchParams }: { searchParams: SearchParams }) {
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
        student: true,
        course: true,
        partner: { select: { name: true } },
        shipment: true,
      },
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const counts: Record<string, number> = {};
  for (const g of grouped) counts[g.status] = g._count._all;
  const allCount = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const tabs = [
    { label: "All", value: undefined as string | undefined, count: allCount },
    ...STATUSES.map((s) => ({
      label: s.charAt(0) + s.slice(1).toLowerCase(),
      value: s as string | undefined,
      count: counts[s] ?? 0,
    })),
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
                active
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {t.label} <span className="opacity-70">({t.count})</span>
            </Link>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Course</th>
              <th className="px-4 py-3 font-medium">Partner</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Shipment</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
            {orders.map((o) => {
              const shipmentStatus = o.shipment
                ? pickLabel(o.shipment, ["status"]).replaceAll("_", " ")
                : null;
              return (
                <tr key={o.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-mono">#{o.id}</td>
                  <td className="px-4 py-3">
                    {pickLabel(o.student, ["name", "fullName", "studentName", "email"], `#${o.studentId}`)}
                  </td>
                  <td className="px-4 py-3">
                    {pickLabel(o.course, ["title", "name", "courseName"], `#${o.courseId}`)}
                  </td>
                  <td className="px-4 py-3">
                    {o.partner?.name ?? <span className="text-gray-400">Direct</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{inr.format(Number(o.amount))}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[o.status] ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {shipmentStatus ? (
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                        {shipmentStatus}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{dateFmt.format(o.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Page {page} of {totalPages} ({total} orders)
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                className="rounded border border-gray-200 bg-white px-3 py-1 hover:bg-gray-50"
                href={href(status, page - 1)}
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                className="rounded border border-gray-200 bg-white px-3 py-1 hover:bg-gray-50"
                href={href(status, page + 1)}
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Orders</h1>
      <p className="mb-4 text-gray-500">All course orders, newest first.</p>
      <Suspense fallback={<p className="text-gray-500">Loading orders...</p>}>
        <OrdersView searchParams={searchParams} />
      </Suspense>
    </div>
  );
}