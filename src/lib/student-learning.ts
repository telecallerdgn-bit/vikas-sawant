import type { CourseMode, LessonType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type Kind = "recorded" | "live" | "materials";

/** Which course modes unlock which section. Change these lists to change who can see what. */
export const KIND_MODES: Record<Kind, CourseMode[]> = {
  recorded: ["ONLINE_PRERECORDED", "HYBRID"],
  live: ["LIVE_STUDY", "LIVE_ONLY", "HYBRID"],
  materials: ["ONLINE_PRERECORDED", "LIVE_STUDY", "STUDY_ONLY", "HYBRID"],
};

const KIND_TYPE: Record<Kind, LessonType> = {
  recorded: "VIDEO",
  live: "LIVE",
  materials: "TEXT",
};

/** Course ids the student has paid for, in a mode that unlocks this section. */
async function ownedCourseIds(studentId: number, kind: Kind): Promise<number[]> {
  const orders = await prisma.order.findMany({
    where: { studentId, status: "PAID" },
    select: { courseId: true, mode: true, course: { select: { mode: true } } },
  });
  const ids = new Set<number>();
  for (const o of orders) {
    if (KIND_MODES[kind].includes(o.mode ?? o.course.mode)) ids.add(o.courseId);
  }
  return [...ids];
}

export type OwnedCourse = { id: number; name: string; coverImage: string | null; count: number };

export async function getOwnedCourses(studentId: number, kind: Kind): Promise<OwnedCourse[]> {
  const ids = await ownedCourseIds(studentId, kind);
  if (ids.length === 0) return [];

  const courses = await prisma.course.findMany({
    where: { id: { in: ids } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      coverImage: true,
      topics: {
        select: { lessons: { where: { isPublished: true, type: KIND_TYPE[kind] }, select: { id: true } } },
      },
    },
  });

  return courses.map((c) => ({
    id: c.id,
    name: c.name,
    coverImage: c.coverImage,
    count: c.topics.reduce((sum, t) => sum + t.lessons.length, 0),
  }));
}

export type FileItem = { id: number; name: string; sizeBytes: number };
export type LessonItem = {
  id: number;
  title: string;
  durationMin: number | null;
  content: string | null;
  isPreview: boolean;
  files: FileItem[];
};
export type TopicItem = { id: number; title: string; summary: string | null; lessons: LessonItem[] };
export type CourseContent = { id: number; name: string; topics: TopicItem[] };

/** Topics and lessons of one course. Returns null when the student may not open it. */
export async function getCourseContent(
  studentId: number,
  courseId: number,
  kind: Kind
): Promise<CourseContent | null> {
  const ids = await ownedCourseIds(studentId, kind);
  if (!ids.includes(courseId)) return null;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      name: true,
      topics: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          summary: true,
          lessons: {
            where: { isPublished: true, type: KIND_TYPE[kind] },
            orderBy: { position: "asc" },
            select: {
              id: true,
              title: true,
              durationMin: true,
              content: true,
              isPreview: true,
              files: { orderBy: { id: "asc" }, select: { id: true, name: true, sizeBytes: true } },
            },
          },
        },
      },
    },
  });
  if (!course) return null;

  return {
    id: course.id,
    name: course.name,
    topics: course.topics.filter((t) => t.lessons.length > 0),
  };
}

export type LessonDetail = {
  id: number;
  title: string;
  content: string | null;
  videoUrl: string | null;
  durationMin: number | null;
  courseId: number;
  courseName: string;
  topicTitle: string;
};

/** One lesson. Returns null when it is unpublished, the wrong type, or not owned by this student. */
export async function getLesson(studentId: number, lessonId: number, kind: Kind): Promise<LessonDetail | null> {
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, isPublished: true, type: KIND_TYPE[kind] },
    select: {
      id: true,
      title: true,
      content: true,
      videoUrl: true,
      durationMin: true,
      topic: { select: { title: true, courseId: true, course: { select: { name: true } } } },
    },
  });
  if (!lesson) return null;

  const ids = await ownedCourseIds(studentId, kind);
  if (!ids.includes(lesson.topic.courseId)) return null;

  return {
    id: lesson.id,
    title: lesson.title,
    content: lesson.content,
    videoUrl: lesson.videoUrl,
    durationMin: lesson.durationMin,
    courseId: lesson.topic.courseId,
    courseName: lesson.topic.course.name,
    topicTitle: lesson.topic.title,
  };
}

export type DownloadableFile = { name: string; storedAs: string; mimeType: string };

/** A study material file. Returns null unless the lesson is published and the student has paid for the course. */
export async function getDownloadableFile(studentId: number, fileId: number): Promise<DownloadableFile | null> {
  const file = await prisma.lessonFile.findFirst({
    where: { id: fileId, lesson: { isPublished: true, type: KIND_TYPE.materials } },
    select: {
      name: true,
      storedAs: true,
      mimeType: true,
      lesson: { select: { topic: { select: { courseId: true } } } },
    },
  });
  if (!file) return null;

  const ids = await ownedCourseIds(studentId, "materials");
  if (!ids.includes(file.lesson.topic.courseId)) return null;

  return { name: file.name, storedAs: file.storedAs, mimeType: file.mimeType };
}

export type LiveClass = {
  id: number;
  title: string;
  content: string | null;
  liveUrl: string | null;
  liveStartsAt: Date;
  durationMin: number | null;
  courseName: string;
};

export async function getLiveClasses(studentId: number): Promise<LiveClass[]> {
  const ids = await ownedCourseIds(studentId, "live");
  if (ids.length === 0) return [];

  const rows = await prisma.lesson.findMany({
    where: { type: "LIVE", isPublished: true, liveStartsAt: { not: null }, topic: { courseId: { in: ids } } },
    orderBy: { liveStartsAt: "asc" },
    select: {
      id: true,
      title: true,
      content: true,
      liveUrl: true,
      liveStartsAt: true,
      durationMin: true,
      topic: { select: { course: { select: { name: true } } } },
    },
  });

  return rows.flatMap((r) =>
    r.liveStartsAt
      ? [
          {
            id: r.id,
            title: r.title,
            content: r.content,
            liveUrl: r.liveUrl,
            liveStartsAt: r.liveStartsAt,
            durationMin: r.durationMin,
            courseName: r.topic.course.name,
          },
        ]
      : []
  );
}