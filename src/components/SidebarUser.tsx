import { getSession } from "@/lib/session";

export default async function SidebarUser() {
  const session = await getSession();
  const name = session?.name ?? "User";
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "U";

  return (
    <div className="mb-5 mt-2 flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50 p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-semibold text-gold-400 ring-2 ring-gold-400/70">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
        <p className="text-xs text-gray-500">Full access</p>
      </div>
    </div>
  );
}