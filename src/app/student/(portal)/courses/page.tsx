import Link from "next/link";
import { Suspense } from "react";
import { ExternalLink, ImageOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/student-auth";
import { MODE_LABEL } from "@/lib/catalog";
import { SHIP_BADGE, SHIP_LABEL } from "@/lib/shipment";
import { Empty, PageTitle, Panel, Pill, dateShort } from "@/components/student/ui";

async function View() {
  const me = await requireStudent();

  const orders = await prisma.order.findMany({
    where: { studentId: me.id, status: "PAID" },
    orderBy: { createdAt: "desc" },
    include: {
      course: { select: { name: true, slug: true, coverImage: true, mode: true } },
      shipment: { select: { status: true } },
    },
  });

  if (orders.length === 0) {
    return (
      <Panel title="My courses">
        <Empty
          title="You have no courses yet."
          text="Courses you buy will appear here once the order is paid."
          cta={{ href: "/courses", label: "Browse courses" }}
        />
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map((o) => (
          <article key={o.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="aspect-[16/9] bg-gradient-to-br from-[#0b2149] to-[#16346b]">
              {o.course.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={o.course.coverImage}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white/60">
                  <ImageOff className="h-8 w-8" />
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-bold leading-snug text-[#0b2149]">{o.course.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{MODE_LABEL[o.mode ?? o.course.mode]}</p>
              <p className="text-xs text-slate-400">Bought on {dateShort.format(o.createdAt)} · Order #{o.id}</p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                {o.shipment ? (
                  <Pill cls={SHIP_BADGE[o.shipment.status]}>Books: {SHIP_LABEL[o.shipment.status]}</Pill>
                ) : (
                  <span />
                )}
                {o.course.slug && (
                  <Link
                    href={`/courses/${o.course.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#a66e00] hover:underline"
                  >
                    Course page <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
        Open your{" "}
        <Link href="/student/recorded" className="font-semibold text-[#a66e00] hover:underline">
          recorded lessons
        </Link>
        ,{" "}
        <Link href="/student/live" className="font-semibold text-[#a66e00] hover:underline">
          live classes
        </Link>{" "}
        and{" "}
        <Link href="/student/materials" className="font-semibold text-[#a66e00] hover:underline">
          study materials
        </Link>
        . What you see depends on the mode you bought.
      </p>
    </div>
  );
}

export default function StudentCoursesPage() {
  return (
    <div className="space-y-6">
      <PageTitle title="My Courses" subtitle="Everything you have enrolled in." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View />
      </Suspense>
    </div>
  );
}