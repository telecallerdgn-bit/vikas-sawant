import { listShipments, parsePageParam, requirePacking, PACKING_PAGE_SIZE, type GroupKey } from "@/lib/packing";
import { SHIP_BADGE, SHIP_LABEL } from "@/lib/shipment";
import { formatDate, formatTime } from "@/lib/format";
import ShipmentActions from "@/components/ShipmentActions";
import Pagination from "@/components/ui/Pagination";
import Icon from "@/components/icons";

const MODE_LABEL: Record<string, string> = {
  LIVE_STUDY: "Live + Study Material",
  HYBRID: "Hybrid",
  STUDY_ONLY: "Study Material Only",
  ONLINE_PRERECORDED: "Online Prerecorded",
};

export default async function GroupView({
  group,
  basePath,
  searchParams,
  emptyTitle,
  emptyHint,
}: {
  group: GroupKey;
  basePath: string;
  searchParams: Promise<{ page?: string }>;
  emptyTitle: string;
  emptyHint: string;
}) {
  await requirePacking();
  const page = parsePageParam((await searchParams).page);
  const { rows, total } = await listShipments(group, page);

  if (rows.length === 0 && page === 1) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <p className="font-medium text-slate-700">{emptyTitle}</p>
        <p className="mt-1 text-sm text-slate-500">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {rows.map((r) => {
          const s = r.order.student;
          const address = [s.addressLine, s.city, s.pincode].filter(Boolean).join(", ");
          return (
            <article key={r.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                  Order #{r.orderId}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${SHIP_BADGE[r.status]}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {SHIP_LABEL[r.status]}
                </span>
              </div>

              <div className="mt-4">
                <p className="font-semibold text-slate-900">{s.name}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
                  <Icon name="phone" className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  {s.mobile}
                </p>
                <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-700">
                  <Icon name="mapPin" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  {address ? (
                    address
                  ) : (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                      Address missing, ask the student before packing
                    </span>
                  )}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <Icon name="book" className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>
                  {r.order.course.name} · {MODE_LABEL[r.order.course.mode] ?? r.order.course.mode}
                </span>
              </div>

              {(r.weightGrams || r.awb) && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  {r.weightGrams && (
                    <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-slate-700">
                      {r.weightGrams} g
                    </span>
                  )}
                  {r.awb && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-blue-700">
                      <Icon name="truck" className="h-3.5 w-3.5" />
                      {r.courier ?? "Courier"} · <span className="font-mono">{r.awb}</span>
                    </span>
                  )}
                </div>
              )}

              <p className="mt-3 text-[11px] text-slate-400">
                Updated {formatDate(r.updatedAt)}, {formatTime(r.updatedAt)}
              </p>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <ShipmentActions id={r.id} status={r.status} />
              </div>
            </article>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <Pagination basePath={basePath} page={page} total={total} pageSize={PACKING_PAGE_SIZE} noun="shipments" />
      </div>
    </div>
  );
}