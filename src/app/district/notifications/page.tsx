import { Suspense } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getDistrictContext } from "@/lib/district";
import {
  Avatar,
  Badge,
  Card,
  Cards,
  EmptyRow,
  NoDistrict,
  PageHeader,
  PageSkeleton,
  StatCard,
  THEAD,
  dateFmt,
  timeFmt,
} from "@/components/district/ui";

const LIMIT = 50;

const CHANNEL_LABEL: Record<string, string> = { SMS: "SMS", WHATSAPP: "WhatsApp", EMAIL: "Email" };
const CHANNEL_CLS: Record<string, string> = {
  SMS: "bg-slate-100 text-slate-700",
  WHATSAPP: "bg-emerald-100 text-emerald-800",
  EMAIL: "bg-blue-100 text-blue-800",
};
const STATUS_CLS: Record<string, string> = {
  SENT: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-700",
  QUEUED: "bg-amber-100 text-amber-800",
};
const STATUS_LABEL: Record<string, string> = { SENT: "Sent", FAILED: "Failed", QUEUED: "Queued" };

async function Notifications() {
  const { session, district } = await getDistrictContext();
  if (!district) return <NoDistrict />;

  // Is district se jude records: partner applications aur partners ke students ki shipments
  const [me, apps, shipments] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId }, select: { email: true, mobile: true } }),
    prisma.partnerApplication.findMany({ where: { districtId: district.id }, select: { id: true } }),
    prisma.shipment.findMany({
      where: { order: { partner: { districtId: district.id } } },
      select: { id: true },
    }),
  ]);

  const appIds = apps.map((a) => a.id);
  const shipmentIds = shipments.map((s) => s.id);
  const mine = [me?.email, me?.mobile].filter((v): v is string => Boolean(v));

  const where: Prisma.NotificationWhereInput = {
    OR: [
      { refType: "application", refId: { in: appIds } },
      { refType: "shipment", refId: { in: shipmentIds } },
      { recipient: { in: mine } },
    ],
  };

  const [rows, grouped] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, take: LIMIT }),
    prisma.notification.groupBy({ by: ["status"], where, _count: { _all: true } }),
  ]);

  const count = (s: string) => grouped.find((g) => g.status === s)?._count._all ?? 0;
  const sent = count("SENT");
  const failed = count("FAILED");
  const queued = count("QUEUED");
  const total = sent + failed + queued;

  return (
    <>
      <Cards>
        <StatCard label="Total messages" value={String(total)} note="Related to your district" tone="blue" icon="mail" />
        <StatCard label="Sent" value={String(sent)} note="Delivered by the system" tone="green" icon="check" />
        <StatCard label="Failed" value={String(failed)} note={failed > 0 ? "Super admin can resend" : "No failures"} tone="amber" icon="info" />
        <StatCard label="Queued" value={String(queued)} note="Waiting to be sent" tone="violet" icon="clock" />
      </Cards>

      <Card title="Notifications" total={total}>
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className={THEAD}>
            <tr>
              <th className="px-6 py-3.5">When</th>
              <th className="px-6 py-3.5">To</th>
              <th className="px-6 py-3.5">Channel</th>
              <th className="px-6 py-3.5">Message</th>
              <th className="px-6 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((n) => (
              <tr key={n.id} className="align-top transition-colors hover:bg-slate-50/70">
                <td className="whitespace-nowrap px-6 py-4">
                  <p className="text-slate-800">{dateFmt.format(n.createdAt)}</p>
                  <p className="text-xs text-slate-400">{timeFmt.format(n.createdAt)}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={n.recipientName} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{n.recipientName}</p>
                      <p className="truncate text-xs text-slate-500">{n.recipient}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CHANNEL_CLS[n.channel] ?? "bg-slate-100 text-slate-700"}`}>
                    {CHANNEL_LABEL[n.channel] ?? n.channel}
                  </span>
                </td>
                <td className="max-w-md px-6 py-4">
                  <p className="line-clamp-2 text-slate-800" title={n.message}>
                    {n.message}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <Badge cls={STATUS_CLS[n.status] ?? "bg-slate-100 text-slate-700"}>
                    {STATUS_LABEL[n.status] ?? n.status}
                  </Badge>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <EmptyRow
                cols={5}
                title="No notifications yet"
                text="Messages about your district's applications and shipments appear here."
              />
            )}
          </tbody>
        </table>
        {total > LIMIT && (
          <p className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
            Showing the latest {LIMIT} of {total} messages.
          </p>
        )}
      </Card>
    </>
  );
}

export default function DistrictNotificationsPage() {
  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="SMS, WhatsApp and email messages linked to your district's applications and shipments."
      />
      <Suspense fallback={<PageSkeleton />}>
        <Notifications />
      </Suspense>
    </>
  );
}