import Link from "next/link";
import { prisma } from "@/lib/prisma";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});
const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  timeZone: "Asia/Kolkata",
});

const ORDER_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-200 text-gray-700",
};
const PAYOUT_STYLES: Record<string, string> = {
  REQUESTED: "bg-amber-100 text-amber-800",
  APPROVED: "bg-blue-100 text-blue-800",
  PAID: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
};

function Panel({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <Link href={href} className="text-xs font-medium text-emerald-700 hover:underline">
          View all
        </Link>
      </div>
      {children}
    </section>
  );
}

export default async function OverviewActivity() {
  const [orders, payouts] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { student: { select: { name: true } }, course: { select: { name: true } } },
    }),
    prisma.payout.findMany({
      orderBy: { requestedAt: "desc" },
      take: 5,
      include: { user: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <Panel title="Recent orders" href="/admin/orders">
        {orders.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-500">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{o.student.name}</p>
                  <p className="truncate text-xs text-gray-500">
                    #{o.id} · {o.course.name} · {dateFmt.format(o.createdAt)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm text-gray-900">{inr.format(Number(o.amount))}</p>
                  <span
                    className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      ORDER_STYLES[o.status] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Recent payout requests" href="/admin/payouts">
        {payouts.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-500">No payout requests yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {payouts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{p.user.name}</p>
                  <p className="truncate text-xs text-gray-500">
                    #{p.id} · {dateFmt.format(p.requestedAt)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm text-gray-900">{inr.format(Number(p.amount))}</p>
                  <span
                    className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      PAYOUT_STYLES[p.status] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}