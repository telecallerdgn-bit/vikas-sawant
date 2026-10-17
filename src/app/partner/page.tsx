import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";
import CopyCode from "@/components/CopyCode";

async function PartnerInfo() {
  const session = await getSession();
  const user = session
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: { name: true, referralCode: true },
      })
    : null;

  return (
    <>
      <p>Welcome, {user?.name}</p>
      <div className="space-y-1">
        <p className="text-xs uppercase text-gray-500">Your reference code</p>
        {user?.referralCode ? (
          <CopyCode code={user.referralCode} />
        ) : (
          <p className="text-sm text-gray-500">No code assigned yet</p>
        )}
        <p className="text-xs text-gray-500">Share this code with students while they register.</p>
      </div>
    </>
  );
}

export default function PartnerPage() {
  return (
    <main className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Partner Dashboard</h1>
      <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
        <PartnerInfo />
      </Suspense>
      <LogoutButton />
    </main>
  );
}