import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSadminForApi } from "@/lib/sadmin-api";
import { parseVideo } from "@/lib/video";

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const id = z.number().int().positive();
const direction = z.enum(["up", "down"]);
const topicTitle = z.string().trim().min(2, "Enter the topic title").max(160);
const summary = z.string().max(1000).default("");

const lessonShape = z.object({
  title: z.string().trim().min(2, "Enter the lesson title").max(160),
  type: z.enum(["VIDEO", "TEXT", "LIVE"]),
  content: z.string().max(20000).default(""),
  videoUrl: z.string().trim().max(500).default(""),
  liveUrl: z.string().trim().max(500).default(""),
  liveStartsAt: z.string().datetime().nullable().default(null),
  durationMin: z.number().int().min(0).max(1440).nullable().default(null),
  isPreview: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});
type LessonInput = z.infer<typeof lessonShape>;

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("topic.create"), title: topicTitle, summary }),
  z.object({ action: z.literal("topic.update"), topicId: id, title: topicTitle, summary }),
  z.object({ action: z.literal("topic.delete"), topicId: id }),
  z.object({ action: z.literal("topic.move"), topicId: id, direction }),
  lessonShape.extend({ action: z.literal("lesson.create"), topicId: id }),
  lessonShape.extend({ action: z.literal("lesson.update"), lessonId: id }),
  z.object({ action: z.literal("lesson.delete"), lessonId: id }),
  z.object({ action: z.literal("lesson.move"), lessonId: id, direction }),
]);

function validateLesson(l: LessonInput): string | null {
  if (l.type === "VIDEO" && !parseVideo(l.videoUrl)) {
    return "Paste a valid YouTube, Vimeo, Bunny Stream or direct MP4/WebM link (https)";
  }
  if (l.type === "LIVE") {
    let ok = false;
    try {
      ok = new URL(l.liveUrl).protocol === "https:";
    } catch {
      ok = false;
    }
    if (!ok) return "Enter the live class link (https)";
    if (!l.liveStartsAt) return "Choose the live class date and time";
  }
  if (l.type === "TEXT" && l.content.trim() === "") return "Write the lesson text";
  return null;
}

// Fields that depend on the lesson type are cleared for the other types.
function lessonData(l: LessonInput) {
  return {
    title: l.title,
    type: l.type,
    content: l.content.trim() || null,
    videoUrl: l.type === "VIDEO" ? l.videoUrl : null,
    liveUrl: l.type === "LIVE" ? l.liveUrl : null,
    liveStartsAt: l.type === "LIVE" && l.liveStartsAt ? new Date(l.liveStartsAt) : null,
    durationMin: l.durationMin,
    isPreview: l.isPreview,
    isPublished: l.isPublished,
  };
}

function swapped(ids: number[], target: number, dir: "up" | "down") {
  const i = ids.indexOf(target);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i === -1 || j < 0 || j >= ids.length) return null;
  const next = [...ids];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getSadminForApi();
  if (!admin) return NextResponse.json({ error: "Not allowed" }, { status: 401 });

  const { id: rawId } = await params;
  if (!/^\d+$/.test(rawId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const courseId = Number(rawId);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const b = parsed.data;

  if (b.action === "lesson.create" || b.action === "lesson.update") {
    const problem = validateLesson(b);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  let note = "";

  try {
    await prisma.$transaction(async (tx) => {
      // A topic must belong to this course.
      const ownTopic = async (topicId: number) => {
        const t = await tx.courseTopic.findFirst({ where: { id: topicId, courseId }, select: { id: true } });
        if (!t) throw new HttpError(404, "Topic not found");
      };
      // A lesson must belong to a topic of this course.
      const ownLesson = async (lessonId: number) => {
        const l = await tx.lesson.findFirst({
          where: { id: lessonId, topic: { courseId } },
          select: { id: true, topicId: true },
        });
        if (!l) throw new HttpError(404, "Lesson not found");
        return l;
      };

      switch (b.action) {
        case "topic.create": {
          const last = await tx.courseTopic.aggregate({ where: { courseId }, _max: { position: true } });
          await tx.courseTopic.create({
            data: {
              courseId,
              title: b.title,
              summary: b.summary.trim() || null,
              position: (last._max.position ?? -1) + 1,
            },
          });
          note = `Topic added: ${b.title}`;
          break;
        }
        case "topic.update": {
          await ownTopic(b.topicId);
          await tx.courseTopic.update({
            where: { id: b.topicId },
            data: { title: b.title, summary: b.summary.trim() || null },
          });
          break;
        }
        case "topic.delete": {
          await ownTopic(b.topicId);
          await tx.courseTopic.delete({ where: { id: b.topicId } });
          note = `Topic deleted (#${b.topicId})`;
          break;
        }
        case "topic.move": {
          await ownTopic(b.topicId);
          const siblings = await tx.courseTopic.findMany({
            where: { courseId },
            orderBy: [{ position: "asc" }, { id: "asc" }],
            select: { id: true },
          });
          const next = swapped(siblings.map((s) => s.id), b.topicId, b.direction);
          if (next) {
            for (let k = 0; k < next.length; k++) {
              await tx.courseTopic.update({ where: { id: next[k] }, data: { position: k } });
            }
          }
          break;
        }
        case "lesson.create": {
          await ownTopic(b.topicId);
          const last = await tx.lesson.aggregate({ where: { topicId: b.topicId }, _max: { position: true } });
          await tx.lesson.create({
            data: { ...lessonData(b), topicId: b.topicId, position: (last._max.position ?? -1) + 1 },
          });
          note = `Lesson added: ${b.title}`;
          break;
        }
        case "lesson.update": {
          await ownLesson(b.lessonId);
          await tx.lesson.update({ where: { id: b.lessonId }, data: lessonData(b) });
          break;
        }
        case "lesson.delete": {
          await ownLesson(b.lessonId);
          await tx.lesson.delete({ where: { id: b.lessonId } });
          note = `Lesson deleted (#${b.lessonId})`;
          break;
        }
        case "lesson.move": {
          const lesson = await ownLesson(b.lessonId);
          const siblings = await tx.lesson.findMany({
            where: { topicId: lesson.topicId },
            orderBy: [{ position: "asc" }, { id: "asc" }],
            select: { id: true },
          });
          const next = swapped(siblings.map((s) => s.id), b.lessonId, b.direction);
          if (next) {
            for (let k = 0; k < next.length; k++) {
              await tx.lesson.update({ where: { id: next[k] }, data: { position: k } });
            }
          }
          break;
        }
      }
    });
  } catch (e) {
    if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("Curriculum update failed", e);
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
  }

  // Only additions and deletions are recorded. A failed log never fails the request.
  if (note) {
    await prisma.auditLog
      .create({
        data: {
          action: "Curriculum changed",
          details: `Course #${courseId} · ${note} · by ${admin.email}`.slice(0, 500),
        },
      })
      .catch(() => {});
  }

  return NextResponse.json({ ok: true });
}