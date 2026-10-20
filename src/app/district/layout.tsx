import { Suspense, type ReactNode } from "react";
import DistrictShell from "@/components/district/DistrictShell";
import { getDistrictContext } from "@/lib/district";

async function Frame({ children }: { children: ReactNode }) {
  const { session, district } = await getDistrictContext();
  return (
    <DistrictShell userName={session.name} districtName={district?.name ?? null}>
      {children}
    </DistrictShell>
  );
}

export default function DistrictLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <Frame>{children}</Frame>
    </Suspense>
  );
}