import { Suspense } from "react";
import { getNetwork, requirePartner } from "@/lib/partner";
import { formatDate, initials } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import StatCards, { type Stat } from "@/components/ui/StatCards";
import TableCard, { EmptyRow, TH, THEAD } from "@/components/ui/TableCard";
import StatusBadge from "@/components/ui/StatusBadge";
import Icon from "@/components/icons";
import Note from "@/components/ui/Note";
import { PageSkeleton } from "@/components/ui/Skeletons";

async function NetworkView() {
  const me = await requirePartner();
  const levels = await getNetwork(me.id);

  const rows = levels.flatMap((l) => l.members.map((m) => ({ ...m, level: l.level })));
  const direct = levels.find((l) => l.level === 1)?.members.length ?? 0;
  const active = rows.filter((r) => r.isActive).length;

  const stats: Stat[] = [
    { label: "Partners in network", value: String(rows.length), hint: "Up to 5 levels deep", icon: "users", tone: "blue" },
    { label: "Direct partners", value: String(direct), hint: "Level 1", icon: "userCheck", tone: "violet" },
    { label: "Active", value: String(active), hint: "Currently active", icon: "check", tone: "emerald" },
  ];

  return (
    <div className="space-y-6">
      <StatCards items={stats} cols={3} />

      <TableCard title="Your network" count={rows.length}>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className={THEAD}>
            <tr>
              <th className={TH}>Level</th>
              <th className={TH}>Partner</th>
              <th className={TH}>District</th>
              <th className={TH}>Status</th>
              <th className={TH}>Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && (
              <EmptyRow colSpan={5} title="No partners in your network yet" hint="Partners who join through you will appear here." />
            )}
            {rows.map((m) => (
              <tr key={m.id} className="transition-colors hover:bg-blue-50/40">
                <td className="px-6 py-4">
                  <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">L{m.level}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                      {initials(m.name)}
                    </span>
                    <span className="font-semibold text-slate-900">{m.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {m.district?.name ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      <Icon name="mapPin" className="h-3.5 w-3.5" />
                      {m.district.name}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge value={m.isActive ? "ACTIVE" : "INACTIVE"} />
                </td>
                <td className="px-6 py-4 text-slate-700">{formatDate(m.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      <Note>For privacy, only name, district and status of your network partners are shown.</Note>
    </div>
  );
}

export default function NetworkPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Referral Network" description="Partners who joined under you, level by level." />
      <Suspense fallback={<PageSkeleton cards={3} />}>
        <NetworkView />
      </Suspense>
    </div>
  );
}