import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PartnerApplyForm from "@/components/PartnerApplyForm";
import ApplicationStatusCheck from "@/components/ApplicationStatusCheck";

async function Form() {
  const districts = await prisma.district.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return <PartnerApplyForm districts={districts} />;
}

export default function PartnerApplyPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 py-10">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">ABC Academy Partners</p>
        <h1 className="mt-1 text-3xl font-semibold">Become a partner</h1>
        <p className="mt-2 max-w-xl text-sm text-gray-600">
          Recommend courses and earn on every enrolment. Apply, get approved, pay the one-time fee and
          your account goes live with your own referral code.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Suspense fallback={<p className="text-sm text-gray-400">Loading...</p>}>
          <Form />
        </Suspense>
        <ApplicationStatusCheck />
      </div>

      <Link href="/" className="inline-block text-sm text-gray-500 underline">
        Back to home
      </Link>
    </main>
  );
}