import { getSession } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";

export default async function Dashboard({ title }: { title: string }) {
  const session = await getSession();
  return (
    <main className="mx-auto max-w-5xl p-6 sm:p-10">
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">ABC Academy</p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back, {session?.name}</p>
        </div>
        <LogoutButton />
      </div>
    </main>
  );
}