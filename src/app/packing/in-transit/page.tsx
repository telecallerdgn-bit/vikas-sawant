import { Suspense } from "react";
import GroupView from "@/components/packing/GroupView";
import PageHeader from "@/components/ui/PageHeader";
import { PACKING_BASE } from "@/lib/routes";

export default function InTransitPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Packing department"
        title="In Transit"
        description="Parcels that are with the courier. Update the status as they move."
      />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />}>
        <GroupView
          group="transit"
          basePath={`${PACKING_BASE}/in-transit`}
          searchParams={searchParams}
          emptyTitle="No parcels in transit"
          emptyHint="Parcels picked up by the courier will appear here."
        />
      </Suspense>
    </div>
  );
}