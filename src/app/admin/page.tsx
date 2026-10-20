import { Suspense } from "react";
import AdminDashboard from "@/components/AdminDashboard";

export default function AdminOverview() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-400">Loading dashboard...</p>}>
      <AdminDashboard />
    </Suspense>
  );
}