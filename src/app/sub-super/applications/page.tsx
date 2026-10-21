import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireSubSuper } from "@/lib/subsuper";
import { APP_PILL, Avatar, Card, Empty, PageHeader, Pill, THEAD, TH, fmtDate } from "@/components/subsuper/ui";

async function View() {
  await requireSubSuper();

  const apps = await prisma.partnerApplication.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      feePaid: true,
      status: true,
      createdAt: true,
      district: { select: { name: true } },
      sponsor: { select: { name: true } },
    },
  });

  return (
    <Card title="All applications" badge={`${apps.length} shown`}>
      {apps.length === 0 ? (
        <Empty title="No applications yet." text="Partner applications appear here when someone applies." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={THEAD}>
              <tr>
                <th className="px-5 py-3 font-semibold">Applicant</th>
                <th className={TH}>District</th>
                <th className={TH}>Sponsor</th>
                <th className={TH}>Fee</th>
                <th className={TH}>Status</th>
                <th className={TH}>Applied</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={a.name} />
                      <span className="font-semibold text-slate-900">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{a.district?.name ?? "—"}</td>
                  <td className="px-4 py-4 text-slate-700">{a.sponsor?.name ?? "Direct"}</td>
                  <td className="px-4 py-4">
                    <Pill cls={a.feePaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}>
                      {a.feePaid ? "Paid" : "Unpaid"}
                    </Pill>
                  </td>
                  <td className="px-4 py-4">
                    <Pill cls={APP_PILL[a.status].cls}>{APP_PILL[a.status].label}</Pill>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-500">{fmtDate.format(a.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Applications" subtitle="Partner applications. You can view them, approvals are done by the admin." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View />
      </Suspense>
    </div>
  );
}