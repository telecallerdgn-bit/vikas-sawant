import { getSession } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";

export default async function Dashboard({ title }: { title: string }) {
  const session = await getSession();
  return (
    <main className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p>Welcome, {session?.name}</p>
      <LogoutButton />
    </main>
  );
}