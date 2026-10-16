import { getSession } from "@/lib/session";

export default async function AdminPage() {
  const session = await getSession();
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <p>Welcome, {session?.name}</p>
    </main>
  );
}