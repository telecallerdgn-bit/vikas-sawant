import { Suspense } from "react";
import { prisma } from "@/lib/prisma";

// Change this if your OrderStatus enum uses a different value for paid orders.
const PAID_STATUS = "PAID" as const;

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

async function DistrictsTable() {
  const districts = await prisma.district.findMany({
    orderBy: { name: "asc" },
    include: {
      admin: { select: { name: true } },
      partners: {
        select: {
          orders: {
            where: { status: PAID_STATUS },
            select: { amount: true },
          },
        },
      },
    },
  });

  if (districts.length === 0) {
    return <p className="text-gray-500">No districts found. Run the seed script first.</p>;
  }

  const rows = districts.map((d) => {
    // Sum in whole paise to avoid floating point errors.
    const paise = d.partners.reduce(
      (total, partner) =>
        total +
        partner.orders.reduce((sum, o) => sum + Math.round(Number(o.amount) * 100), 0),
      0,
    );
    return { ...d, partnerCount: d.partners.length, sales: paise / 100 };
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3 font-medium">Code</th>
            <th className="px-4 py-3 font-medium">District</th>
            <th className="px-4 py-3 font-medium">District Admin</th>
            <th className="px-4 py-3 text-right font-medium">Partners</th>
            <th className="px-4 py-3 text-right font-medium">Sales</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.id} className="border-t border-gray-100">
              <td className="px-4 py-3 font-mono">{d.code ?? "-"}</td>
              <td className="px-4 py-3">{d.name}</td>
              <td className="px-4 py-3">
                {d.admin ? (
                  d.admin.name
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                    Unassigned
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">{d.partnerCount}</td>
              <td className="px-4 py-3 text-right font-mono">{inr.format(d.sales)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DistrictsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Districts</h1>
      <p className="mb-4 text-gray-500">All districts configured in the system.</p>
      <Suspense fallback={<p className="text-gray-500">Loading districts...</p>}>
        <DistrictsTable />
      </Suspense>
    </div>
  );
}