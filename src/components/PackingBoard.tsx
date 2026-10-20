import { prisma } from "@/lib/prisma";
import ShipmentActions from "@/components/ShipmentActions";
import { SHIP_BADGE, SHIP_LABEL } from "@/lib/shipment";

async function load() {
  return prisma.shipment.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      order: {
        include: {
          student: true,
          course: { select: { name: true } },
        },
      },
    },
  });
}
type Row = Awaited<ReturnType<typeof load>>[number];

const QUEUE = ["AWAITING_PACKING", "PACKED"];
const DONE = ["DELIVERED", "RETURNED"];

const date = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

function Section({ title, hint, rows }: { title: string; hint?: string; rows: Row[] }) {
  return (
    <section className="space-y-2">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {hint && <p className="text-xs text-gray-500">{hint}</p>}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="p-4">Order</th>
              <th className="p-4">Student · Address</th>
              <th className="p-4">Course</th>
              <th className="p-4">Parcel</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const st = r.order.student;
              const address = [st.addressLine, st.city, st.pincode].filter(Boolean).join(", ");
              return (
                <tr key={r.id} className="border-t align-top">
                  <td className="p-4 font-mono">#{r.orderId}</td>
                  <td className="p-4">
                    <p className="font-medium">{st.name}</p>
                    <p className="text-xs text-gray-500">{st.mobile}</p>
                    {address ? (
                      <p className="mt-1 max-w-xs text-xs text-gray-600">{address}</p>
                    ) : (
                      <p className="mt-1 text-xs text-red-600">No delivery address on file</p>
                    )}
                  </td>
                  <td className="p-4 text-gray-700">{r.order.course.name}</td>
                  <td className="p-4">
                    {r.weightGrams ? <p>{r.weightGrams} g</p> : <p className="text-gray-400">—</p>}
                    {r.awb && (
                      <>
                        <p className="text-xs">{r.courier}</p>
                        <p className="font-mono text-xs text-gray-500">{r.awb}</p>
                      </>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${SHIP_BADGE[r.status]}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {SHIP_LABEL[r.status]}
                    </span>
                    <p className="mt-1 text-xs text-gray-400">{date(r.updatedAt)}</p>
                  </td>
                  <td className="p-4">
                    <ShipmentActions id={r.id} status={r.status} />
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  Nothing here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function PackingBoard() {
  const all = await load();

  const queue = all.filter((r) => QUEUE.includes(r.status));
  const moving = all.filter((r) => !QUEUE.includes(r.status) && !DONE.includes(r.status));
  const done = all.filter((r) => DONE.includes(r.status)).reverse().slice(0, 20);

  const cards = [
    { label: "Awaiting packing", value: all.filter((r) => r.status === "AWAITING_PACKING").length },
    { label: "Packed, needs label", value: all.filter((r) => r.status === "PACKED").length },
    { label: "In delivery", value: moving.length },
    { label: "Delivered", value: all.filter((r) => r.status === "DELIVERED").length },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border bg-white p-4">
            <p className="text-xs uppercase text-gray-500">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      <Section
        title="Packing queue"
        hint="Enter the parcel weight and mark packed. Then add the courier and AWB to create the shipment."
        rows={queue}
      />
      <Section title="In delivery" rows={moving} />
      <Section title="Completed" hint="Latest 20" rows={done} />
    </div>
  );
}