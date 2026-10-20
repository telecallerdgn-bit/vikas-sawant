import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import AdminShell from "@/components/AdminShell";

async function ShellWithUser({ children }: { children: React.ReactNode }) {
  const [session, alerts] = await Promise.all([
    getSession(),
    prisma.notification.count({ where: { status: "FAILED" } }),
  ]);

  return (
    <AdminShell name={session?.name ?? "Admin"} alerts={alerts}>
      {children}
    </AdminShell>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ShellWithUser>{children}</ShellWithUser>
    </Suspense>
  );
}