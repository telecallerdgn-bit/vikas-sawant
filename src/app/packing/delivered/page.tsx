import { Suspense } from "react";
import GroupView from "@/components/packing/GroupView";
import PageHeader from "@/components/ui/PageHeader";
import { PACKING_BASE } from "@/lib/routes";

export default function DeliveredPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Packing department" title="Delivered" description="Completed deliveries, newest first." />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />}>
        <GroupView
          group="delivered"
          basePath={`${PACKING_BASE}/delivered`}
          searchParams={searchParams}
          emptyTitle="No deliveries yet"
          emptyHint="Delivered parcels will appear here."
        />
      </Suspense>
    </div>
  );
}