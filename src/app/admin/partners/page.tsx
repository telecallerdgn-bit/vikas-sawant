import { Suspense } from "react";
import PartnersTable from "@/components/PartnersTable";

export default function PartnersPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">Super Admin</p>
        <h1 className="text-2xl font-semibold">Partners</h1>
      </div>
      <Suspense fallback={<p className="text-sm text-gray-400">Loading...</p>}>
        <PartnersTable />
      </Suspense>
    </div>
  );
}