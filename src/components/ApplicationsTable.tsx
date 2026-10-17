import { prisma } from "@/lib/prisma";
import ExpandableText from "@/components/ExpandableText";
import ApplicationActions from "@/components/ApplicationActions";

const STATUS: Record<string, { label: string; cls: string }> = {
  SUBMITTED: { label: "Submitted", cls: "bg-amber-100 text-amber-800" },
  UNDER_REVIEW: { label: "Under review", cls: "bg-amber-100 text-amber-800" },
  MORE_INFO: { label: "More info needed", cls: "bg-blue-100 text-blue-800" },
  APPROVED: { label: "Approved", cls: "bg-blue-100 text-blue-800" },
  REJECTED: { label: "Rejected", cls: "bg-red-100 text-red-700" },
  ACTIVE: { label: "Active", cls: "bg-emerald-100 text-emerald-800" },
};

export default async function ApplicationsTable() {
  const apps = await prisma.partnerApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      district: { select: { name: true } },
      sponsor: { select: { name: true, referralCode: true } },
    },
  });

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-emerald-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="p-4">Applicant</th>
            <th className="p-4">District</th>
            <th className="p-4">Sponsor</th>
            <th className="p-4">Experience</th>
            <th className="p-4">Fee</th>
            <th className="p-4">Status</th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody>
          {apps.map((a) => {
            const s = STATUS[a.status];
            return (
              <tr key={a.id} className="border-t align-top">
                <td className="p-4">
                  <p className="font-semibold">{a.name}</p>
                  <p className="text-xs text-gray-500">
                    {a.email} · {a.mobile}
                  </p>
                  {a.panMasked && <p className="font-mono text-xs text-gray-400">PAN {a.panMasked}</p>}
                </td>
                <td className="p-4">{a.district?.name ?? "—"}</td>
                <td className="p-4">
                  {a.sponsor ? (
                    <>
                      <p>{a.sponsor.name}</p>
                      <p className="font-mono text-xs text-gray-500">{a.sponsor.referralCode}</p>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-4 text-gray-700">
                  <ExpandableText text={a.experience} />
                  {a.note && <p className="mt-1 text-xs text-gray-500">Note: {a.note}</p>}
                </td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      a.feePaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {a.feePaid ? "Paid" : "Unpaid"}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${s.cls}`}>{s.label}</span>
                </td>
                <td className="p-4">
                  <ApplicationActions id={a.id} status={a.status} feePaid={a.feePaid} />
                </td>
              </tr>
            );
          })}
          {apps.length === 0 && (
            <tr>
              <td colSpan={7} className="p-6 text-center text-gray-500">
                No applications yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}