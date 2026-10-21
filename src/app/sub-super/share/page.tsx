import { Suspense } from "react";
import { CalendarDays, Coins, Info, ListChecks } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SHARE_TYPE, requireSubSuper } from "@/lib/subsuper";
import { Card, Empty, PageHeader, StatCard, THEAD, TH, fmtDate, inr } from "@/components/subsuper/ui";

async function View() {
  const me = await requireSubSuper();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const where = { userId: me.id, type: SHARE_TYPE }; // only this user's own entries

  const [entries, total, month] = await Promise.all([
    prisma.ledgerEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        order: {
          select: {
            id: true,
            student: { select: { name: true } },
            course: { select: { name: true } },
          },
        },
      },
    }),
    prisma.ledgerEntry.aggregate({ where, _sum: { amount: true }, _count: { _all: true } }),
    prisma.ledgerEntry.aggregate({ where: { ...where, createdAt: { gte: monthStart } }, _sum: { amount: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total credited"
          value={inr.format(Number(total._sum.amount ?? 0))}
          sub="Your share so far"
          icon={Coins}
          tone="green"
        />
        <StatCard
          label="This month"
          value={inr.format(Number(month._sum.amount ?? 0))}
          sub="Credited this month"
          icon={CalendarDays}
          tone="blue"
        />
        <StatCard
          label="Entries"
          value={String(total._count._all)}
          sub="Orders you earned on"
          icon={ListChecks}
          tone="purple"
        />
      </div>

      <Card title="Share ledger" badge={`${total._count._all} total`}>
        {entries.length === 0 ? (
          <Empty title="No share credited yet." text="Your share appears here when an order is paid." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={THEAD}>
                <tr>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className={TH}>Order</th>
                  <th className={TH}>Student and course</th>
                  <th className={`${TH} text-right`}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">{fmtDate.format(e.createdAt)}</td>
                    <td className="px-4 py-4 font-mono">{e.order ? `#${e.order.id}` : "—"}</td>
                    <td className="px-4 py-4">
                      {e.order ? (
                        <>
                          <p className="text-slate-900">{e.order.student.name}</p>
                          <p className="text-xs text-slate-500">{e.order.course.name}</p>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-medium lining-nums">
                      {inr.format(Number(e.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
        <Info className="mt-0.5 h-[18px] w-[18px] shrink-0 text-amber-600" />
        <p>Your share is credited when an order is paid. The sharing rule is set by the admin team.</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="My Share" subtitle="What has been credited to you from paid orders." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View />
      </Suspense>
    </div>
  );
}