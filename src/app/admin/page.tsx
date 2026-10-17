import { prisma } from "@/lib/prisma";

export default async function AdminOverview() {
  const [total, partners, inactive] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "PARTNER", isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
  ]);

  const cards = [
    { label: "Total users", value: total },
    { label: "Active partners", value: partners },
    { label: "Inactive accounts", value: inactive },
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">Super Admin</p>
        <h1 className="text-2xl font-semibold">Overview</h1>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border bg-white p-4">
            <p className="text-xs uppercase text-gray-500">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}