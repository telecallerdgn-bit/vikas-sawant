import { Suspense } from "react";
import { redirect } from "next/navigation";

async function Go({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  redirect(`/partner-apply${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`);
  return null; // never reached, but gives the component a valid return type
}

export default function SignupPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  return (
    <Suspense fallback={null}>
      <Go searchParams={searchParams} />
    </Suspense>
  );
}