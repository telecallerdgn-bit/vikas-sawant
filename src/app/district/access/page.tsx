import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getDistrictContext } from "@/lib/district";
import { Card, Cards, NoDistrict, PageHeader, PageSkeleton, StatCard } from "@/components/district/ui";
import { OrderStatus } from "@prisma/client";

type SearchParams = Promise<{ kind?: string; id?: string }>;

const ALLOWED = [
  "Business partners registered in your district",
  "Paid orders and enrolments from those partners",
  "Your own commission entries and wallet",
  "Your own withdrawal requests",
  "Notifications about your district",
];
const BLOCKED = [
  "Records of any other district",
  "Super admin pages (roles, payouts, ledger, audit log, settings)",
  "Changing roles, suspending users or approving payouts",
  "Other district admins' wallets and withdrawals",
];

const fieldCls =
  "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15";

async function Access({ searchParams }: { searchParams: SearchParams }) {
  const { district } = await getDistrictContext();
  if (!district) return <NoDistrict />;

  const sp = await searchParams;
  const kind = sp.kind === "partner" ? "partner" : "order";
  const raw = (sp.id ?? "").trim();

  const [partners, orders] = await Promise.all([
    prisma.user.count({ where: { role: "PARTNER", districtId: district.id } }),
    prisma.order.count({ where: { status: OrderStatus.PAID, partner: { districtId: district.id } } }),
  ]);

  // Result: null = abhi check nahi kiya, "invalid" = galat input, true/false = mila ya nahi
  let result: null | "invalid" | boolean = null;
  if (raw) {
    if (!/^\d+$/.test(raw)) {
      result = "invalid";
    } else {
      const id = Number(raw);
      const found =
        kind === "order"
          ? await prisma.order.findFirst({ where: { id, partner: { districtId: district.id } }, select: { id: true } })
          : await prisma.user.findFirst({
              where: { id, role: "PARTNER", districtId: district.id },
              select: { id: true },
            });
      result = Boolean(found);
    }
  }

  const label = kind === "order" ? "Order" : "Partner";

  return (
    <>
      <Cards>
        <StatCard label="Your role" value="District Admin" note="Scoped to one district" tone="blue" icon="check" />
        <StatCard label="Your district" value={district.name} note={district.code ?? "No district code"} tone="violet" icon="info" />
        <StatCard label="Partners in scope" value={String(partners)} note="You can see these" tone="green" icon="trending" />
        <StatCard label="Orders in scope" value={String(orders)} note="Paid orders you can see" tone="amber" icon="rupee" />
      </Cards>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title="What you can access">
          <ul className="divide-y divide-slate-100">
            {ALLOWED.map((t) => (
              <li key={t} className="flex items-center gap-3 px-6 py-3.5 text-sm text-slate-800">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
                {t}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="What is blocked">
          <ul className="divide-y divide-slate-100">
            {BLOCKED.map((t) => (
              <li key={t} className="flex items-center gap-3 px-6 py-3.5 text-sm text-slate-800">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">✕</span>
                {t}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Check a record">
        <div className="space-y-4 px-6 pb-6">
          <p className="text-sm text-slate-500">
            Enter an order or partner ID to see if it is inside your district. Records outside your district
            show as not accessible, and no details are revealed.
          </p>

          <form method="get" action="/district/access" className="flex flex-wrap items-center gap-3">
            <select name="kind" defaultValue={kind} aria-label="Record type" className={fieldCls}>
              <option value="order">Order</option>
              <option value="partner">Partner</option>
            </select>
            <input
              name="id"
              defaultValue={raw}
              inputMode="numeric"
              placeholder="Enter ID, e.g. 12"
              aria-label="Record ID"
              className={`${fieldCls} w-48`}
            />
            <button
              type="submit"
              className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Check access
            </button>
          </form>

          {result === "invalid" && (
            <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Enter a valid number for the ID.
            </p>
          )}
          {result === true && (
            <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              ✓ {label} #{raw} is in {district.name} district. You can access it.
            </p>
          )}
          {result === false && (
            <p role="status" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              ✕ {label} #{raw} is not accessible to you. It is outside {district.name} district or does not exist.
            </p>
          )}
        </div>
      </Card>
    </>
  );
}

export default function DistrictAccessPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <PageHeader title="Access check" subtitle="See exactly what your account can and cannot access." />
      <Suspense fallback={<PageSkeleton />}>
        <Access searchParams={searchParams} />
      </Suspense>
    </>
  );
}