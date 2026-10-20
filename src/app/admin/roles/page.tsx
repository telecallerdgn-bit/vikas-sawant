import { Suspense } from "react";
import { getSession } from "@/lib/session";
import UserTable from "@/components/UserTable";
import Icon from "@/components/icons";

async function UsersPanel() {
  const session = await getSession();
  return <UserTable currentUserId={session?.userId ?? null} />;
}

function PanelSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[132px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Super Admin</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Role Assignments</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage what each user can access and whether they can sign in.
        </p>
      </header>

      <Suspense fallback={<PanelSkeleton />}>
        <UsersPanel />
      </Suspense>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-700">
        <Icon name="info" className="mt-0.5 h-[18px] w-[18px] shrink-0 text-amber-600" />
        <p>
          Deactivated users cannot sign in. Give the Admin role only to people you fully trust, as it
          allows full control of the system.
        </p>
      </div>
    </div>
  );
}