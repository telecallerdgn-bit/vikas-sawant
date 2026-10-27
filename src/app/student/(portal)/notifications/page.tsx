import { Suspense } from "react";
import { requireStudent } from "@/lib/student-auth";
import { notificationsFor, recipientsOf } from "@/lib/student-data";
import { CHANNEL_LABEL, Empty, PageTitle, Panel, dateTime } from "@/components/student/ui";

async function View() {
  const me = await requireStudent();
  const items = await notificationsFor(recipientsOf(me), 50);

  return (
    <Panel title="Messages">
      {items.length === 0 ? (
        <Empty title="No messages yet." text="SMS, WhatsApp and email messages sent to you appear here." />
      ) : (
        <ul className="divide-y divide-slate-100 border-t border-slate-100">
          {items.map((n) => (
            <li key={n.id} className="flex items-start gap-3 px-5 py-4">
              <span className="mt-0.5 shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                {CHANNEL_LABEL[n.channel]}
              </span>
              <p className="flex-1 text-sm text-slate-800">{n.message}</p>
              <span className="shrink-0 whitespace-nowrap text-xs text-slate-400">{dateTime.format(n.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export default function StudentNotificationsPage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Notifications" subtitle="Messages we have sent you about your orders and deliveries." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View />
      </Suspense>
    </div>
  );
}