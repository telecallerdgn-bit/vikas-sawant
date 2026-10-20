import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import DistrictAdminSelect from "@/components/DistrictAdminSelect";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

// Chhote inline icons (icons.tsx par depend nahi)
const ICONS: Record<string, ReactNode> = {
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  userCheck: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6 1.4 0 2.6.3 3.6.9" />
      <path d="m16 17 2 2 4-4" />
    </>
  ),
  userX: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6 1.4 0 2.6.3 3.6.9" />
      <path d="m17 15 5 5" />
      <path d="m22 15-5 5" />
    </>
  ),
  rupee: (
    <>
      <path d="M6 4h12" />
      <path d="M6 9h12" />
      <path d="M9 4c5 0 7 2 7 5s-2 5-7 5h-1l8 7" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" />
    </>
  ),
};

function Svg({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

// Tailwind ko poori class chahiye, isliye rang yahan literal likhe hain
const TONES = {
  blue: { card: "border-blue-100 bg-blue-50/60", icon: "bg-blue-500", label: "text-blue-700" },
  green: { card: "border-emerald-100 bg-emerald-50/60", icon: "bg-emerald-500", label: "text-emerald-700" },
  amber: { card: "border-amber-100 bg-amber-50/60", icon: "bg-orange-500", label: "text-orange-700" },
  violet: { card: "border-violet-100 bg-violet-50/60", icon: "bg-violet-500", label: "text-violet-700" },
} as const;

async function DistrictsTable() {
  const [districts, admins] = await Promise.all([
    prisma.district.findMany({
      orderBy: { name: "asc" },
      include: {
        admin: { select: { id: true, name: true } },
        partners: {
          select: {
            orders: {
              where: { status: OrderStatus.PAID },
              select: { amount: true },
            },
          },
        },
      },
    }),
    // Sirf wahi users jinhe Role Assignments me "District Admin" banaya gaya hai
    prisma.user.findMany({
      where: { role: "DISTRICT_ADMIN", isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  const rows = districts.map((d) => {
    // Sum in whole paise to avoid floating point errors.
    const paise = d.partners.reduce(
      (total, p) => total + p.orders.reduce((sum, o) => sum + Math.round(Number(o.amount) * 100), 0),
      0,
    );
    return { ...d, partnerCount: d.partners.length, sales: paise / 100 };
  });

  const assigned = rows.filter((r) => r.admin).length;
  const totalSales = rows.reduce((a, r) => a + r.sales, 0);

  const cards: { label: string; value: string; note: string; tone: keyof typeof TONES; icon: string }[] = [
    { label: "Total districts", value: String(rows.length), note: "Configured in the system", tone: "blue", icon: "pin" },
    { label: "Admin assigned", value: String(assigned), note: "Have a district admin", tone: "green", icon: "userCheck" },
    { label: "Unassigned", value: String(rows.length - assigned), note: "Need a district admin", tone: "amber", icon: "userX" },
    { label: "Total sales", value: inr.format(totalSales), note: "Paid orders only", tone: "violet", icon: "rupee" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const t = TONES[c.tone];
          return (
            <div key={c.label} className={`rounded-2xl border p-5 ${t.card}`}>
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${t.icon}`}>
                  <Svg name={c.icon} />
                </span>
                <span className={`text-sm font-semibold uppercase tracking-wide ${t.label}`}>{c.label}</span>
              </div>
              <p className="mt-4 text-3xl font-bold tabular-nums text-slate-900">{c.value}</p>
              <p className="mt-1 text-sm text-slate-500">{c.note}</p>
            </div>
          );
        })}
      </div>

      {admins.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No user has the <b>District Admin</b> role yet. Go to{" "}
          <Link href="/admin/roles" className="font-semibold underline">
            Role Assignments
          </Link>
          , set a user&apos;s role to District Admin, then come back to assign them here.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">All districts</h2>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {rows.length} total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Code</th>
                <th className="px-6 py-3.5">District</th>
                <th className="px-6 py-3.5">District admin</th>
                <th className="px-6 py-3.5 text-right">Partners</th>
                <th className="px-6 py-3.5">Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((d) => {
                const share = totalSales > 0 ? Math.round((d.sales / totalSales) * 100) : 0;
                return (
                  <tr key={d.id} className="align-middle transition-colors hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      {d.code ? (
                        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">{d.code}</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Svg name="pin" />
                        </span>
                        <span className="font-semibold text-slate-900">{d.name}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {/* key badalne se admin badalte hi control naya state leta hai */}
                      <DistrictAdminSelect
                        key={`${d.id}-${d.admin?.id ?? 0}`}
                        districtId={d.id}
                        currentAdminId={d.admin?.id ?? null}
                        admins={admins}
                      />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium tabular-nums text-slate-700">
                        <Svg name="users" className="h-3.5 w-3.5" />
                        {d.partnerCount}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className={`font-medium tabular-nums ${d.sales > 0 ? "text-slate-900" : "text-slate-300"}`}>
                        {inr.format(d.sales)}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1 w-28 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${share}%` }} />
                        </div>
                        <span className="text-xs text-slate-400">{share}% of total</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center">
                    <p className="font-medium text-slate-700">No districts yet</p>
                    <p className="mt-1 text-sm text-slate-500">Run the seed script to add districts.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DistrictsSkeleton() {
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

export default function DistrictsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Super Admin</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Districts</h1>
        <p className="mt-1 text-sm text-slate-500">
          All districts configured in the system. Assign a district admin to each one.
        </p>
      </header>
      <Suspense fallback={<DistrictsSkeleton />}>
        <DistrictsTable />
      </Suspense>
    </div>
  );
}