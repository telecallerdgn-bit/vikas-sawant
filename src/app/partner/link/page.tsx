import { Suspense } from "react";
import {
  REFERRAL_PATH,
  getPartnerProfile,
  getSiteOrigin,
  requirePartner,
} from "@/lib/partner";
import PageHeader from "@/components/ui/PageHeader";
import ReferralLinkCard from "@/components/ReferralLinkCard";
import Note from "@/components/ui/Note";

async function LinkView() {
  const me = await requirePartner();
  const [profile, origin] = await Promise.all([getPartnerProfile(me.id), getSiteOrigin()]);

  if (!profile.referralCode) {
    return <Note>Your referral code has not been generated yet. Please contact support.</Note>;
  }

  const link = `${origin}${REFERRAL_PATH}?ref=${encodeURIComponent(profile.referralCode)}`;

  return (
    <div className="space-y-6">
      <ReferralLinkCard code={profile.referralCode} link={link} />
      <Note>
        Anyone who signs up through your link is linked to you. Orders placed by them earn you commission.
      </Note>
    </div>
  );
}

export default function LinkPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="My Referral Link" description="Share your link and earn commission on every enrolment." />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />}>
        <LinkView />
      </Suspense>
    </div>
  );
}