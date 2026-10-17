import { Suspense } from "react";
import ApplicationsTable from "@/components/ApplicationsTable";

export default function ApplicationsPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">Super Admin</p>
        <h1 className="text-2xl font-semibold">Applications</h1>
      </div>

      <Suspense fallback={<p className="text-sm text-gray-400">Loading...</p>}>
        <ApplicationsTable />
      </Suspense>

      <p className="text-xs text-gray-500">
        A partner becomes active only when approved and the registration &amp; training fee is paid.
      </p>
    </div>
  );
}