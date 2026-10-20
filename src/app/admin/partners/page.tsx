import { Suspense } from "react";
import PartnersTable from "@/components/PartnersTable";
import { DISPLAY } from "@/lib/ui";

export default function PartnersPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Super Admin</p>
        <h1 className={`${DISPLAY} mt-1 text-3xl font-bold text-slate-900`}>Partners</h1>
        <p className="mt-1 text-sm text-slate-500">
          Everyone who sells for you, with their referral code, students and earnings.
        </p>
      </header>

      <Suspense fallback={<p className="text-sm text-slate-400">Loading partners...</p>}>
        <PartnersTable />
      </Suspense>
    </div>
  );
}