import { Suspense } from "react";
import GroupView from "@/components/packing/GroupView";
import PageHeader from "@/components/ui/PageHeader";
import StatCards, { type Stat } from "@/components/ui/StatCards";
import { CardsSkeleton } from "@/components/ui/Skeletons";
import { getCounts, requirePacking } from "@/lib/packing";
import { PACKING_BASE } from "@/lib/routes";

type SearchParams = Promise<{ page?: string }>;

async function Summary() {
  await requirePacking();
  const c = await getCounts();
  const stats: Stat[] = [
    { label: "Awaiting packing", value: String(c.queue), hint: "Weigh and pack these", icon: "package", tone: "orange" },
    { label: "Packed", value: String(c.packed), hint: "Ready for a courier", icon: "check", tone: "blue" },
    { label: "Needs attention", value: String(c.exceptions), hint: "Failed or returned", icon: "alert", tone: "rose" },
  ];
  return <StatCards items={stats} cols={3} />;
}

export default function PackingQueuePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Packing department"
        title="Packing Queue"
        description="Only paid orders that include printed books appear here. You see delivery details only, no payment or commission data."
      />
      <Suspense fallback={<CardsSkeleton count={3} />}>
        <Summary />
      </Suspense>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />}>
        <GroupView
          group="queue"
          basePath={PACKING_BASE}
          searchParams={searchParams}
          emptyTitle="Nothing to pack right now"
          emptyHint="New paid orders with books will appear here."
        />
      </Suspense>
    </div>
  );
}