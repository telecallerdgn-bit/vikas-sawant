import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/student-auth";
import { MODE_LABEL } from "@/lib/catalog";
import { Empty, ORDER_PILL, PageTitle, Panel, Pill, dateShort, rupees } from "@/components/student/ui";

async function View() {
  const me = await requireStudent();

  const orders = await prisma.order.findMany({
    where: { studentId: me.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { course: { select: { name: true, mode: true } } },
  });
  const hasPending = orders.some((o) => o.status === "PENDING");

  return (
    <div className="space-y-4">
      <Panel title="Orders">
        {orders.length === 0 ? (
          <Empty
            title="No orders yet."
            text="Your purchases will be listed here."
            cta={{ href: "/courses", label: "Browse courses" }}
          />
        ) : (
          <div className="overflow-x-auto border-t border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Course</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-slate-100 align-top">
                    <td className="px-5 py-4">
                      <p className="font-mono">#{o.id}</p>
                      <p className="text-xs text-slate-400">{dateShort.format(o.createdAt)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-900">{o.course.name}</p>
                      <p className="text-xs text-slate-500">{MODE_LABEL[o.mode ?? o.course.mode]}</p>
                    </td>
                    <td className="px-4 py-4 text-right font-mono lining-nums">{rupees.format(Number(o.amount))}</td>
                    <td className="px-4 py-4">
                      <Pill cls={ORDER_PILL[o.status].cls}>{ORDER_PILL[o.status].label}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {hasPending && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
          If you have already paid for an order marked &quot;Payment pending&quot;, contact support with the order number.
        </p>
      )}
    </div>
  );
}

export default function StudentOrdersPage() {
  return (
    <div className="space-y-6">
      <PageTitle title="My Orders" subtitle="Your purchases and their payment status." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View />
      </Suspense>
    </div>
  );
}