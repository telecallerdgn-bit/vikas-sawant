import { Suspense } from "react";
import AdminOverview from "@/components/admin/AdminOverview";

export default function AdminOverviewPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-slate-400">Loading dashboard...</p>}>
      <AdminOverview searchParams={searchParams} />
    </Suspense>
  );
}