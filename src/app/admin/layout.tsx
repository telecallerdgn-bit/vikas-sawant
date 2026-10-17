import { Suspense } from "react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import AdminNav from "@/components/AdminNav";
import SidebarUser from "@/components/SidebarUser";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="flex w-60 shrink-0 flex-col border-r bg-white p-4">
        <Link href="/admin" className="text-xs font-medium uppercase tracking-wide text-gray-500">
          ABC Academy
        </Link>

        <Suspense fallback={<p className="mb-4 mt-1 text-sm text-gray-400">Loading...</p>}>
          <SidebarUser />
        </Suspense>

        <AdminNav />

        <div className="mt-auto pt-4">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-x-auto p-6">{children}</main>
    </div>
  );
}