import Link from "next/link";
import { Suspense } from "react";
import { Check, MapPin, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/student-auth";
import { SHIP_BADGE, SHIP_LABEL } from "@/lib/shipment";
import { Empty, PageTitle, Panel, Pill, dateTime } from "@/components/student/ui";

async function View() {
  const me = await requireStudent();

  const [shipments, student] = await Promise.all([
    prisma.shipment.findMany({
      where: { order: { studentId: me.id } },
      orderBy: { createdAt: "desc" },
      include: {
        order: { select: { id: true, course: { select: { name: true } } } },
        events: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.student.findUnique({
      where: { id: me.id },
      select: { addressLine: true, city: true, pincode: true },
    }),
  ]);

  const address = [student?.addressLine, student?.city, student?.pincode].filter(Boolean).join(", ");
  const waiting = shipments.some((s) => s.status === "AWAITING_PACKING");

  if (shipments.length === 0) {
    return (
      <Panel title="Book tracking">
        <Empty
          title="No parcels yet."
          text="If your course includes study material, you can follow the delivery here."
        />
      </Panel>
    );
  }

  return (
    <div className="space-y-5">
      {!address && waiting && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          We do not have your delivery address yet, so your books cannot be sent.{" "}
          <Link href="/student/profile" className="font-semibold underline">
            Add your address
          </Link>
        </p>
      )}

      {shipments.map((s) => (
        <section key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b2149] text-white">
                <Truck className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold text-[#0b2149]">{s.order.course.name}</p>
                <p className="text-xs text-slate-500">Order #{s.order.id}</p>
              </div>
            </div>
            <Pill cls={SHIP_BADGE[s.status]}>{SHIP_LABEL[s.status]}</Pill>
          </div>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Courier</p>
              <p className="mt-0.5 text-slate-900">
                {s.awb ? (
                  <>
                    {s.courier} <span className="font-mono text-xs text-slate-500">· {s.awb}</span>
                  </>
                ) : (
                  <span className="text-slate-400">Not booked yet</span>
                )}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <MapPin className="h-3.5 w-3.5" /> Delivering to
              </p>
              <p className="mt-0.5 text-slate-900">{address || <span className="text-slate-400">No address</span>}</p>
            </div>
          </div>

          <ol className="mt-5">
            {s.events.map((e, i) => {
              const last = i === s.events.length - 1;
              return (
                <li key={e.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${
                        last ? "bg-[#f8b915] text-[#0b2149]" : "bg-emerald-500 text-white"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {!last && <span className="my-1 w-0.5 flex-1 bg-emerald-200" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-semibold text-slate-900">{SHIP_LABEL[e.status]}</p>
                    <p className="text-xs text-slate-400">{dateTime.format(e.createdAt)}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

export default function StudentTrackingPage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Book Tracking" subtitle="Follow your study material from packing to delivery." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View />
      </Suspense>
    </div>
  );
}