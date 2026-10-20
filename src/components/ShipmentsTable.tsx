import { prisma } from "@/lib/prisma";
import { SHIP_BADGE, SHIP_LABEL } from "@/lib/shipment";
import Icon, { type IconName } from "@/components/icons";

const dateFmt = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" });
const timeFmt = new Intl.DateTimeFormat("en-IN", { timeStyle: "short", timeZone: "Asia/Kolkata" });

function initials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
}

// Tailwind ko poori class chahiye, isliye rang yahan literal likhe hain
const TONES = {
  blue: { card: "border-blue-100 bg-blue-50/60", icon: "bg-blue-500", label: "text-blue-700" },
  amber: { card: "border-amber-100 bg-amber-50/60", icon: "bg-orange-500", label: "text-orange-700" },
  violet: { card: "border-violet-100 bg-violet-50/60", icon: "bg-violet-500", label: "text-violet-700" },
  green: { card: "border-emerald-100 bg-emerald-50/60", icon: "bg-emerald-500", label: "text-emerald-700" },
} as const;

type Card = {
  label: string;
  value: string;
  note: string;
  tone: keyof typeof TONES;
  icon: IconName;
};

export default async function ShipmentsTable() {
  const rows = await prisma.shipment.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      order: {
        include: {
          student: { select: { name: true } },
          course: { select: { name: true } },
        },
      },
    },
  });

  const withAwb = rows.filter((r) => r.awb).length;

  // lib/shipment.ts ke exact status keys ke hisaab se counts
  const countIn = (keys: string[]) => rows.filter((r) => keys.includes(r.status)).length;

  const awaitingPacking = countIn(["AWAITING_PACKING"]);
  const packed = countIn(["PACKED", "LABEL_GENERATED"]);
  const inTransit = countIn(["DISPATCHED", "IN_TRANSIT", "OUT_FOR_DELIVERY"]);
  const delivered = countIn(["DELIVERED"]);
  const problems = countIn(["DELIVERY_FAILED", "RETURNED"]);
  const deliveryRate = rows.length ? Math.round((delivered / rows.length) * 100) : 0;

  const byStatus = new Map<string, number>();
  for (const r of rows) byStatus.set(r.status, (byStatus.get(r.status) ?? 0) + 1);

  const cards: Card[] = [
    {
      label: "Total shipments",
      value: rows.length.toLocaleString("en-IN"),
      note: `${withAwb} with tracking`,
      tone: "blue",
      icon: "info",
    },
    {
      label: "Pending dispatch",
      value: (awaitingPacking + packed).toLocaleString("en-IN"),
      note: `${awaitingPacking} awaiting packing · ${packed} packed`,
      tone: "amber",
      icon: "clock",
    },
    {
      label: "In transit",
      value: inTransit.toLocaleString("en-IN"),
      note: "Picked up, on the way or out for delivery",
      tone: "violet",
      icon: "trending",
    },
    {
      label: "Delivered",
      value: delivered.toLocaleString("en-IN"),
      note: rows.length ? `${deliveryRate}% of all shipments` : "No shipments yet",
      tone: "green",
      icon: "check",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const t = TONES[c.tone];
          return (
            <div key={c.label} className={`rounded-2xl border p-5 ${t.card}`}>
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${t.icon}`}>
                  <Icon name={c.icon} className="h-5 w-5" />
                </span>
                <span className={`text-sm font-semibold uppercase tracking-wide ${t.label}`}>{c.label}</span>
              </div>
              <p className="mt-4 text-3xl font-bold tabular-nums text-slate-900">{c.value}</p>
              <p className="mt-1 text-sm text-slate-500">{c.note}</p>
            </div>
          );
        })}
      </div>

      {problems > 0 && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="font-semibold">
            {problems} {problems === 1 ? "shipment needs" : "shipments need"} attention:
          </span>{" "}
          delivery failed or returned to origin.
        </div>
      )}

      {/* Status breakdown */}
      {byStatus.size > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {[...byStatus.entries()].map(([status, count]) => (
            <span
              key={status}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                SHIP_BADGE[status] ?? "bg-slate-100 text-slate-700"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {SHIP_LABEL[status] ?? status}
              <span className="tabular-nums opacity-70">{count}</span>
            </span>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">All shipments</h2>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {rows.length} total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Order</th>
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Course</th>
                <th className="px-6 py-3.5">Courier · AWB</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-slate-50/70">
                  <td className="px-6 py-4">
                    <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                      #{r.orderId}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white"
                        aria-hidden="true"
                      >
                        {initials(r.order.student.name)}
                      </span>
                      <span className="font-medium text-slate-900">{r.order.student.name}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-800">{r.order.course.name}</td>

                  <td className="px-6 py-4">
                    {r.awb ? (
                      <>
                        <p className="font-medium text-slate-800">{r.courier ?? "Courier"}</p>
                        <p className="font-mono text-xs text-slate-500">{r.awb}</p>
                      </>
                    ) : (
                      <span className="text-sm text-slate-400">Not booked yet</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        SHIP_BADGE[r.status] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {SHIP_LABEL[r.status] ?? r.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-slate-800">{dateFmt.format(r.updatedAt)}</p>
                    <p className="text-xs text-slate-400">{timeFmt.format(r.updatedAt)}</p>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <p className="font-medium text-slate-700">No shipments yet</p>
                    <p className="mt-1 text-sm text-slate-500">Paid orders with books will appear here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}