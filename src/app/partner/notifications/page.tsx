import { Suspense } from "react";
import { Inbox } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const CHANNEL = { SMS: "SMS", WHATSAPP: "WhatsApp", EMAIL: "Email" } as const;

const when = (d: Date) =>
  d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

async function List() {
  const session = await getSession();
  const me = session
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: { email: true, mobile: true },
      })
    : null;

  // Only messages sent to this partner's own email or mobile
  const recipients = [me?.email, me?.mobile].filter((v): v is string => Boolean(v));
  const items = recipients.length
    ? await prisma.notification.findMany({
        where: { recipient: { in: recipients } },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white py-14 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-500">
          <Inbox className="h-8 w-8" />
        </span>
        <p className="mt-3 font-medium text-slate-700">No notifications yet.</p>
        <p className="mt-1 max-w-xs text-sm text-slate-500">Messages we send you will appear here.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
      {items.map((n) => (
        <li key={n.id} className="flex items-start gap-3 p-4">
          <span className="mt-0.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
            {CHANNEL[n.channel]}
          </span>
          <p className="flex-1 text-sm text-slate-800">{n.message}</p>
          <span className="whitespace-nowrap text-xs text-slate-400">{when(n.createdAt)}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PartnerNotificationsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Partner portal</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Notifications</h1>
        <p className="mt-1 text-sm text-slate-500">SMS, WhatsApp and email messages sent to you.</p>
      </header>
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <List />
      </Suspense>
    </div>
  );
}