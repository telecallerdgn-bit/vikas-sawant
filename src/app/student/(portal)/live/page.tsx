import { Suspense } from "react";
import { Video } from "lucide-react";
import { requireStudent } from "@/lib/student-auth";
import { getLiveClasses, type LiveClass } from "@/lib/student-learning";
import { Empty, PageTitle, Panel, Pill, dateTime } from "@/components/student/ui";

const MIN = 60 * 1000;

function ClassRow({ c, now }: { c: LiveClass; now: number }) {
  const start = c.liveStartsAt.getTime();
  const end = start + (c.durationMin ?? 120) * MIN;
  const joinable = !!c.liveUrl && now >= start - 15 * MIN && now <= end;
  const ended = now > end;

  return (
    <li className="flex flex-wrap items-center gap-4 px-5 py-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0b2149] text-white">
        <Video className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[#0b2149]">{c.title}</p>
        <p className="text-xs text-slate-500">
          {c.courseName} · {dateTime.format(c.liveStartsAt)}
          {c.durationMin != null && ` · ${c.durationMin} min`}
        </p>
      </div>
      {joinable ? (
        <a
          href={c.liveUrl as string}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-[#f8b915] px-5 py-2 text-sm font-bold text-[#0b2149] hover:bg-[#e3a600]"
        >
          Join class
        </a>
      ) : ended ? (
        <Pill cls="bg-slate-100 text-slate-600">Ended</Pill>
      ) : (
        <Pill cls="bg-amber-100 text-amber-800">Join opens 15 min before</Pill>
      )}
    </li>
  );
}

async function View() {
  const me = await requireStudent(); // dynamic access first, so Date.now() below is safe
  const classes = await getLiveClasses(me.id);
  const now = Date.now();

  const isOver = (c: LiveClass) => c.liveStartsAt.getTime() + (c.durationMin ?? 120) * MIN < now;
  const upcoming = classes.filter((c) => !isOver(c));
  const past = classes.filter(isOver).reverse().slice(0, 20);

  if (classes.length === 0) {
    return (
      <Panel title="Live Classes">
        <Empty
          title="No live classes yet."
          text="Live classes open for courses bought in the Live + Study Material, Live Only or Hybrid mode, once your order is paid and classes are scheduled."
          cta={{ href: "/student/courses", label: "My courses" }}
        />
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <Panel title="Upcoming and live now">
        {upcoming.length === 0 ? (
          <Empty title="Nothing scheduled right now." text="New classes will appear here when they are added." />
        ) : (
          <ul className="divide-y divide-slate-100 border-t border-slate-100">
            {upcoming.map((c) => (
              <ClassRow key={c.id} c={c} now={now} />
            ))}
          </ul>
        )}
      </Panel>

      {past.length > 0 && (
        <Panel title="Past classes">
          <ul className="divide-y divide-slate-100 border-t border-slate-100">
            {past.map((c) => (
              <ClassRow key={c.id} c={c} now={now} />
            ))}
          </ul>
        </Panel>
      )}

      <p className="text-xs text-slate-500">Refresh this page just before class time to see the Join button.</p>
    </div>
  );
}

export default function LivePage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Live Classes" subtitle="Your scheduled live sessions." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View />
      </Suspense>
    </div>
  );
}