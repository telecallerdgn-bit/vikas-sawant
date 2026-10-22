import { Suspense } from "react";
import PackingShell from "@/components/PackingShell";
import { getCounts, getPackingUser, requirePacking } from "@/lib/packing";

async function Gate({ children }: { children: React.ReactNode }) {
  const me = await requirePacking();
  const [user, counts] = await Promise.all([getPackingUser(me.id), getCounts()]);
  return (
    <PackingShell name={user.name} place={user.district?.name ?? null} counts={counts}>
      {children}
    </PackingShell>
  );
}

export default function PackingLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}