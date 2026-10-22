import { Suspense } from "react";
import GroupView from "@/components/packing/GroupView";
import PageHeader from "@/components/ui/PageHeader";
import { PACKING_BASE } from "@/lib/routes";

export default function ExceptionsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Packing department"
        title="Delivery Exceptions"
        description="Deliveries that failed or were returned. Retry the delivery or return the parcel to origin."
      />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />}>
        <GroupView
          group="exceptions"
          basePath={`${PACKING_BASE}/exceptions`}
          searchParams={searchParams}
          emptyTitle="No delivery exceptions"
          emptyHint="Failed or returned deliveries will appear here."
        />
      </Suspense>
    </div>
  );
}