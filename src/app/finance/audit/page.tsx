import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireFinance } from "@/lib/finance";
import { Card, Empty, FinanceHeader, Pager, TH, THEAD, fmtDateTime } from "@/components/finance/ui";

const PAGE_SIZE = 30;

const WHERE = {
  OR: [
    { action: { startsWith: "Payout" } },
    { action: { startsWith: "Refund" } },
    { action: { startsWith: "Commission" } },
  ],
};

type SearchParams = Promise<{ page?: string }>;

async function View({ searchParams }: { searchParams: SearchParams }) {
  await requireFinance();

  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: WHERE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where: WHERE }),
  ]);

  const ids = [...new Set(logs.map((l) => l.userId).filter((v): v is number => v !== null))];
  const users = ids.length
    ? await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } })
    : [];
  const names = new Map(users.map((u) => [u.id, u.name]));
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <Card title="Money activity" badge={`${total} total`}>
        {logs.length === 0 ? (
          <Empty title="No activity yet." text="Payout approvals, rejections and payments are recorded here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={THEAD}>
                <tr>
                  <th className="px-5 py-3 font-semibold">When</th>
                  <th className={TH}>Who</th>
                  <th className={TH}>Action</th>
                  <th className={TH}>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-t border-slate-100 align-top hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">{fmtDateTime.format(l.createdAt)}</td>
                    <td className="px-4 py-3.5 text-slate-800">
                      {l.userId ? (names.get(l.userId) ?? `User #${l.userId}`) : "System"}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">{l.action}</td>
                    <td className="max-w-md px-4 py-3.5 text-slate-600">{l.details ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pager base="/finance/audit" params={{}} page={page} pages={pages} />
    </div>
  );
}

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="space-y-6">
      <FinanceHeader title="Audit Reports" subtitle="Who approved, rejected or paid what, and when." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View searchParams={searchParams} />
      </Suspense>
    </div>
  );
}