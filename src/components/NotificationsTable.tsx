import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ResendButton from "@/components/ResendButton";
import Icon, { type IconName } from "@/components/icons";

const PAGE_SIZE = 25;
const CHANNELS = ["SMS", "WHATSAPP", "EMAIL"] as const;
const STATUSES = ["SENT", "FAILED", "QUEUED"] as const;

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

// Tailwind ko poori class chahiye, isliye rang yahan literal likhe hain
const TONES = {
  blue: { card: "border-blue-100 bg-blue-50/60", icon: "bg-blue-500", label: "text-blue-700" },
  green: { card: "border-emerald-100 bg-emerald-50/60", icon: "bg-emerald-500", label: "text-emerald-700" },
  red: { card: "border-red-100 bg-red-50/60", icon: "bg-red-500", label: "text-red-700" },
  amber: { card: "border-amber-100 bg-amber-50/60", icon: "bg-orange-500", label: "text-orange-700" },
} as const;

type Props = { channel?: string; status?: string; page: number };

const dateFmt = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" });
const timeFmt = new Intl.DateTimeFormat("en-IN", { timeStyle: "short", timeZone: "Asia/Kolkata" });

function initials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
}

function href(params: { channel?: string; status?: string; page?: number }) {
  const q = new URLSearchParams();
  if (params.channel) q.set("channel", params.channel);
  if (params.status) q.set("status", params.status);
  if (params.page && params.page > 1) q.set("page", String(params.page));
  const s = q.toString();
  return `/admin/notifications${s ? `?${s}` : ""}`;
}

function Chip({ active, to, children }: { active: boolean; to: string; children: React.ReactNode }) {
  return (
    <Link
      href={to}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function NotificationsTable({ channel, status, page }: Props) {
  const where = {
    ...(channel ? { channel: channel as (typeof CHANNELS)[number] } : {}),
    ...(status ? { status: status as (typeof STATUSES)[number] } : {}),
  };

  const [rows, total, grouped] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.notification.count({ where }),
    prisma.notification.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const count = (s: string) => grouped.find((g) => g.status === s)?._count._all ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const sent = count("SENT");
  const failed = count("FAILED");
  const queued = count("QUEUED");
  const all = sent + failed + queued;
  const successRate = all ? Math.round((sent / all) * 100) : 0;

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const filtered = Boolean(channel || status);

  const cards: { label: string; value: string; note: string; tone: keyof typeof TONES; icon: IconName }[] = [
    { label: "Total messages", value: all.toLocaleString("en-IN"), note: "All channels", tone: "blue", icon: "mail" },
    {
      label: "Sent",
      value: sent.toLocaleString("en-IN"),
      note: all ? `${successRate}% success rate` : "No messages yet",
      tone: "green",
      icon: "check",
    },
    {
      label: "Failed",
      value: failed.toLocaleString("en-IN"),
      note: failed > 0 ? "Use Resend on the failed rows" : "No failures",
      tone: "red",
      icon: "info",
    },
    {
      label: "Queued",
      value: queued.toLocaleString("en-IN"),
      note: "Waiting to be sent",
      tone: "amber",
      icon: "clock",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const t = TONES[c.tone];
          return (
            <div key={c.label} className={`rounded-2xl border p-5 ${t.card}`}>
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${t.icon}`}>
                  <Icon name={c.icon} className="h-5 w-5" />
                </span>
                <span className={`text-sm font-semibold uppercase tracking-wide ${t.label}`}>{c.label}</span>
              </div>
              <p className="mt-4 text-3xl font-bold tabular-nums text-slate-900">{c.value}</p>
              <p className="mt-1 text-sm text-slate-500">{c.note}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-semibold text-slate-500">Channel</span>
          <Chip active={!channel} to={href({ status })}>
            All
          </Chip>
          {CHANNELS.map((c) => (
            <Chip key={c} active={channel === c} to={href({ channel: c, status })}>
              {CHANNEL_LABEL[c]}
            </Chip>
          ))}
        </div>
        <div className="hidden h-6 w-px bg-slate-200 lg:block" />
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-semibold text-slate-500">Status</span>
          <Chip active={!status} to={href({ channel })}>
            All
          </Chip>
          {STATUSES.map((s) => (
            <Chip key={s} active={status === s} to={href({ channel, status: s })}>
              {STATUS_LABEL[s]}
            </Chip>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">
            {status ? `${STATUS_LABEL[status]} notifications` : "All notifications"}
            {channel ? ` · ${CHANNEL_LABEL[channel]}` : ""}
          </h2>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {total} total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">When</th>
                <th className="px-6 py-3.5">To</th>
                <th className="px-6 py-3.5">Channel</th>
                <th className="px-6 py-3.5">Message</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">
                  <span className="sr-only">Actions</span>
                </th>
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
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white"
                        aria-hidden="true"
                      >
                        {initials(n.recipientName)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{n.recipientName}</p>
                        <p className="truncate text-xs text-slate-500">{n.recipient}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CHANNEL_CLS[n.channel]}`}>
                      {CHANNEL_LABEL[n.channel]}
                    </span>
                  </td>

                  <td className="max-w-md px-6 py-4">
                    <p className="line-clamp-2 text-slate-800" title={n.message}>
                      {n.message}
                    </p>
                    <span className="mt-1.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-500">
                      {n.event}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLS[n.status]}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {STATUS_LABEL[n.status]}
                    </span>
                    {n.status === "FAILED" && n.error && (
                      <p className="mt-1.5 max-w-[14rem] text-xs text-red-600">{n.error}</p>
                    )}
                    {n.attempts > 1 && <p className="mt-1 text-xs text-slate-400">{n.attempts} attempts</p>}
                  </td>

                  <td className="px-6 py-4 text-right">{n.status === "FAILED" && <ResendButton id={n.id} />}</td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <p className="font-medium text-slate-700">
                      {filtered ? "No notifications match these filters" : "No notifications yet"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {filtered
                        ? "Try a different channel or status."
                        : "They appear here when shipments move or applications change."}
                    </p>
                    {filtered && (
                      <Link
                        href={href({})}
                        className="mt-3 inline-block rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Clear filters
                      </Link>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {from}–{to} of {total} messages
          </span>
          {pages > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs">
                Page {page} of {pages}
              </span>
              {page > 1 ? (
                <Link
                  href={href({ channel, status, page: page - 1 })}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded-lg border border-slate-100 px-3 py-1.5 font-medium text-slate-300">
                  Previous
                </span>
              )}
              {page < pages ? (
                <Link
                  href={href({ channel, status, page: page + 1 })}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Next
                </Link>
              ) : (
                <span className="rounded-lg border border-slate-100 px-3 py-1.5 font-medium text-slate-300">
                  Next
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}