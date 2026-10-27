import Link from "next/link";
import { Suspense } from "react";
import { Bell, BookOpen, GraduationCap, ImageOff, ShoppingBag, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/student-auth";
import { notificationsFor, recentNotificationCount, recipientsOf } from "@/lib/student-data";
import { MODE_LABEL } from "@/lib/catalog";
import { SHIP_BADGE, SHIP_LABEL } from "@/lib/shipment";
import {
  CHANNEL_LABEL,
  Empty,
  PageTitle,
  Panel,
  Pill,
  TRANSIT,
  Tile,
  dateShort,
  dateTime,
} from "@/components/student/ui";

async function View() {
  const me = await requireStudent(); // dynamic access first, so Date.now() below is safe
  const recipients = recipientsOf(me);
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [paid, orderCount, updates, recent] = await Promise.all([
    prisma.order.findMany({
      where: { studentId: me.id, status: "PAID" },
      orderBy: { createdAt: "desc" },
      include: {
        course: { select: { name: true, slug: true, coverImage: true, mode: true } },
        shipment: { select: { status: true } },
      },
    }),
    prisma.order.count({ where: { studentId: me.id } }),
    notificationsFor(recipients, 4),
    recentNotificationCount(recipients, since),
  ]);

  const courses = new Set(paid.map((o) => o.courseId)).size;
  const onTheWay = paid.filter((o) => o.shipment && TRANSIT.includes(o.shipment.status)).length;
  const firstName = me.name.split(" ")[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="Active courses" value={String(courses)} sub="Courses you own" icon={GraduationCap} tone="navy" />
        <Tile label="Books on the way" value={String(onTheWay)} sub="Parcels in transit" icon={Truck} tone="gold" />
        <Tile label="Orders" value={String(orderCount)} sub="All your orders" icon={ShoppingBag} tone="sky" />
        <Tile label="Updates" value={String(recent)} sub="Messages in 30 days" icon={Bell} tone="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="My courses" action={paid.length > 0 ? { href: "/student/courses", label: "View all" } : undefined}>
          {paid.length === 0 ? (
            <Empty
              title="No courses yet."
              text={`Hello ${firstName}, pick a course and it will show up here once your order is paid.`}
              cta={{ href: "/courses", label: "Browse courses" }}
            />
          ) : (
            <ul className="divide-y divide-slate-100 border-t border-slate-100">
              {paid.slice(0, 3).map((o) => (
                <li key={o.id} className="flex items-center gap-4 px-5 py-4">
                  {o.course.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={o.course.coverImage}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-14 w-20 shrink-0 rounded-lg border border-slate-100 object-cover"
                    />
                  ) : (
                    <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                      <ImageOff className="h-5 w-5" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[#0b2149]">{o.course.name}</p>
                    <p className="text-xs text-slate-500">
                      {MODE_LABEL[o.mode ?? o.course.mode]} · bought {dateShort.format(o.createdAt)}
                    </p>
                  </div>
                  {o.shipment && <Pill cls={SHIP_BADGE[o.shipment.status]}>{SHIP_LABEL[o.shipment.status]}</Pill>}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Latest updates" action={updates.length > 0 ? { href: "/student/notifications", label: "View all" } : undefined}>
          {updates.length === 0 ? (
            <Empty title="No updates yet." text="Order and delivery messages will appear here." />
          ) : (
            <ul className="divide-y divide-slate-100 border-t border-slate-100">
              {updates.map((n) => (
                <li key={n.id} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      {CHANNEL_LABEL[n.channel]}
                    </span>
                    <span className="text-xs text-slate-400">{dateTime.format(n.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{n.message}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <p className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
        <BookOpen className="h-4 w-4 shrink-0 text-amber-600" />
        Tests and assignments will be added here soon.
        <Link href="/student/support" className="ml-auto font-semibold text-[#a66e00] hover:underline">
          Need help?
        </Link>
      </p>
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Dashboard" subtitle="Your courses, orders and updates at a glance." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View />
      </Suspense>
    </div>
  );
}