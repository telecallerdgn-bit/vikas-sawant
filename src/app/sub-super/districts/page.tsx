import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireSubSuper } from "@/lib/subsuper";
import { Card, Empty, PageHeader, THEAD, TH } from "@/components/subsuper/ui";

async function View() {
  await requireSubSuper();

  const [districts, partners] = await Promise.all([
    prisma.district.findMany({
      orderBy: { name: "asc" },
      include: { admin: { select: { name: true } } },
    }),
    prisma.user.findMany({
      where: { role: "PARTNER", districtId: { not: null } },
      select: { districtId: true, isActive: true, _count: { select: { students: true } } },
    }),
  ]);

  const stats = new Map<number, { total: number; active: number; students: number }>();
  for (const p of partners) {
    const key = p.districtId as number;
    const cur = stats.get(key) ?? { total: 0, active: 0, students: 0 };
    cur.total += 1;
    if (p.isActive) cur.active += 1;
    cur.students += p._count.students;
    stats.set(key, cur);
  }

  return (
    <Card title="All districts" badge={`${districts.length} total`}>
      {districts.length === 0 ? (
        <Empty title="No districts yet." text="Districts appear here once the admin adds them." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={THEAD}>
              <tr>
                <th className="px-5 py-3 font-semibold">District</th>
                <th className={TH}>District admin</th>
                <th className={`${TH} text-right`}>Partners</th>
                <th className={`${TH} text-right`}>Active</th>
                <th className={`${TH} text-right`}>Students</th>
              </tr>
            </thead>
            <tbody>
              {districts.map((d) => {
                const s = stats.get(d.id) ?? { total: 0, active: 0, students: 0 };
                return (
                  <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{d.name}</p>
                      {d.code && <p className="font-mono text-xs text-slate-500">{d.code}</p>}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{d.admin?.name ?? "—"}</td>
                    <td className="px-4 py-4 text-right lining-nums">{s.total}</td>
                    <td className="px-4 py-4 text-right lining-nums">{s.active}</td>
                    <td className="px-4 py-4 text-right font-medium lining-nums">{s.students}</td>
                  </tr>
                );
              })}
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
      <PageHeader title="Districts" subtitle="Partners and students by district. Read-only." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View />
      </Suspense>
    </div>
  );
}