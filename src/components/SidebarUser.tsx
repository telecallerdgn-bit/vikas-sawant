import { getSession } from "@/lib/session";

export default async function SidebarUser() {
  const session = await getSession();
  return (
    <>
      <p className="mt-1 font-semibold">{session?.name}</p>
      <p className="mb-4 text-xs text-gray-500">Full access</p>
    </>
  );
}