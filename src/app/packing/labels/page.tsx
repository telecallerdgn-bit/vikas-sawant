import { Suspense } from "react";
import GroupView from "@/components/packing/GroupView";
import PageHeader from "@/components/ui/PageHeader";
import { PACKING_BASE } from "@/lib/routes";

export default function LabelsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Packing department"
        title="Shipping Labels"
        description="Shipments that have a label. Mark them as picked up when the courier collects them."
      />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />}>
        <GroupView
          group="labels"
          basePath={`${PACKING_BASE}/labels`}
          searchParams={searchParams}
          emptyTitle="No shipments waiting for pickup"
          emptyHint="Shipments you create will appear here until the courier picks them up."
        />
      </Suspense>
    </div>
  );
}