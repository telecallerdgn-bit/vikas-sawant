import { Suspense } from "react";
import { getSession } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";
import PackingBoard from "@/components/PackingBoard";

async function Welcome() {
  const session = await getSession();
  return <p className="mt-1 text-sm text-gray-500">Welcome, {session?.name}</p>;
}

export default function PackingPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Dispatch desk</p>
          <h1 className="text-2xl font-semibold">Packing Department</h1>
          <Suspense fallback={null}>
            <Welcome />
          </Suspense>
        </div>
        <LogoutButton />
      </div>

      <Suspense fallback={<p className="text-sm text-gray-400">Loading...</p>}>
        <PackingBoard />
      </Suspense>
    </main>
  );
}