import { Suspense } from "react";
import PartnerShell from "@/components/PartnerShell";
import { getPartnerProfile, requirePartner } from "@/lib/partner";

async function Gate({ children }: { children: React.ReactNode }) {
  const me = await requirePartner();
  const profile = await getPartnerProfile(me.id);
  return (
    <PartnerShell name={profile.name} code={profile.referralCode}>
      {children}
    </PartnerShell>
  );
}

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}