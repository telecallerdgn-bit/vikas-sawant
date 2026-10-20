import { Suspense } from "react";
import ShipmentsTable from "@/components/ShipmentsTable";

export default function ShipmentsPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">Super Admin</p>
        <h1 className="text-2xl font-semibold">Shipments</h1>
        <p className="mt-1 text-sm text-gray-500">
          Book parcels for paid orders. The packing team updates the status.
        </p>
      </div>

      <Suspense fallback={<p className="text-sm text-gray-400">Loading...</p>}>
        <ShipmentsTable />
      </Suspense>
    </div>
  );
}