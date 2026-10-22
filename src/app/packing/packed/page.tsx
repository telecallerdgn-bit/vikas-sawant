import { Suspense } from "react";
import GroupView from "@/components/packing/GroupView";
import PageHeader from "@/components/ui/PageHeader";
import { PACKING_BASE } from "@/lib/routes";

export default function PackedPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Packing department"
        title="Packed · Create Shipment"
        description="Choose the courier and enter the AWB number to create the shipment."
      />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />}>
        <GroupView
          group="packed"
          basePath={`${PACKING_BASE}/packed`}
          searchParams={searchParams}
          emptyTitle="No packed parcels waiting"
          emptyHint="Parcels you mark as packed will appear here."
        />
      </Suspense>
    </div>
  );
}