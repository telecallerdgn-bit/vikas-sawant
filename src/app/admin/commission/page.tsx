import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import CommissionEditor from "@/components/CommissionEditor";
import { DEFAULT_RULE } from "@/lib/commission-calc";
import { getCurrentVersion, getPreviewSample, toRuleValues } from "@/lib/commission";

const dateFmt = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" });

async function CommissionContent() {
  const [current, versions, sample] = await Promise.all([
    getCurrentVersion(),
    prisma.commissionRuleVersion.findMany({ orderBy: { version: "desc" }, take: 25 }),
    getPreviewSample(),
  ]);

  // Version ko save karne wale ka naam (AuditLog ki tarah, User se seedha relation nahi hai)
  const ids = [...new Set(versions.flatMap((v) => [v.createdById, v.approvedById]).filter((x): x is number => x !== null))];
  const users = ids.length ? await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } }) : [];
  const names = new Map(users.map((u) => [u.id, u.name]));

  const initial = current ? toRuleValues(current) : DEFAULT_RULE;

  return (
    <div className="space-y-8">
      <CommissionEditor
        // key badalne par form naye saved version se dobara shuru hota hai
        key={`${current?.version ?? 0}-${current?.approvedAt ? 1 : 0}`}
        initial={initial}
        currentVersion={current?.version ?? null}
        approved={Boolean(current?.approvedAt)}
        sample={sample}
      />

      <section>
        <h2 className="text-xl font-bold text-slate-900">Version history</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Version</th>
                  <th className="px-6 py-3.5">Saved</th>
                  <th className="px-6 py-3.5">By</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {versions.map((v) => (
                  <tr key={v.id} className="transition-colors hover:bg-blue-50/40">
                    <td className="px-6 py-4 font-mono font-semibold text-slate-900">v{v.version}</td>
                    <td className="px-6 py-4 font-mono text-slate-700">{dateFmt.format(v.createdAt)}</td>
                    <td className="px-6 py-4 text-slate-800">
                      {v.createdById ? (names.get(v.createdById) ?? `User #${v.createdById}`) : "System"}
                    </td>
                    <td className="px-6 py-4">
                      {v.approvedAt ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          Approved
                          {v.approvedById && names.get(v.approvedById) ? ` by ${names.get(v.approvedById)}` : ""}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{v.note ?? <span className="text-slate-300">—</span>}</td>
                  </tr>
                ))}
                {versions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <p className="font-medium text-slate-700">No versions saved yet</p>
                      <p className="mt-1 text-sm text-slate-500">Save the rule above to create version 1.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function CommissionSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <div className="h-[34rem] animate-pulse rounded-2xl border border-slate-200 bg-white" />
      <div className="h-[34rem] animate-pulse rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}

export default function CommissionPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Super Admin</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Commission Rules</h1>
        <p className="mt-1 text-sm text-slate-500">
          Decide how each paid order is shared between partners, district and sub super admins.
        </p>
      </header>
      <Suspense fallback={<CommissionSkeleton />}>
        <CommissionContent />
      </Suspense>
    </div>
  );
}