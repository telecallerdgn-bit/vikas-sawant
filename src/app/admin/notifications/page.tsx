import { Suspense } from "react";
import NotificationsTable from "@/components/NotificationsTable";

const CHANNELS = ["SMS", "WHATSAPP", "EMAIL"];
const STATUSES = ["SENT", "FAILED", "QUEUED"];

function NotificationsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[132px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="h-16 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string; status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const channel = sp.channel && CHANNELS.includes(sp.channel) ? sp.channel : undefined;
  const status = sp.status && STATUSES.includes(sp.status) ? sp.status : undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const testMode = (process.env.NOTIFY_MODE ?? "dev") === "dev";

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Super Admin</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Notification Log</h1>
        <p className="mt-1 text-sm text-slate-500">
          Every SMS, WhatsApp and email the system sends to students and partners.
        </p>
      </header>

      {testMode && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4"
        >
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <svg
              className="h-[18px] w-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </span>
          <div className="text-sm">
            <p className="font-semibold text-amber-900">Test mode is on</p>
            <p className="mt-0.5 text-amber-800">
              Messages are logged here but not delivered to anyone. To send them for real, connect an
              SMS or WhatsApp provider and set{" "}
              <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs text-amber-900">
                NOTIFY_MODE=&quot;webhook&quot;
              </code>
              .
            </p>
          </div>
        </div>
      )}

      <Suspense fallback={<NotificationsSkeleton />}>
        <NotificationsTable channel={channel} status={status} page={page} />
      </Suspense>
    </div>
  );
}