export type LessonType = "VIDEO" | "TEXT" | "LIVE";

export type LessonDTO = {
  id: number;
  title: string;
  type: LessonType;
  content: string;
  videoUrl: string;
  liveUrl: string;
  liveStartsAt: string | null; // ISO string
  durationMin: number | null;
  isPreview: boolean;
  isPublished: boolean;
};

export type TopicDTO = {
  id: number;
  title: string;
  summary: string;
  lessons: LessonDTO[];
};

export const LESSON_TYPE_LABEL: Record<LessonType, string> = {
  VIDEO: "Video",
  TEXT: "Text",
  LIVE: "Live class",
};

export function formatMinutes(total: number) {
  if (!total || total <= 0) return "0 min";
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h}h` : `${h}h ${String(m).padStart(2, "0")}m`;
}