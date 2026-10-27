import path from "node:path";

/** Private folder, outside `public`, so files can only be opened through the download route. */
export const STORAGE_DIR = path.join(process.cwd(), "storage", "materials");

export const MAX_BYTES = 10 * 1024 * 1024;
export const MAX_FILES_PER_LESSON = 10;

export const ALLOWED: Record<string, string> = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

/** The first bytes of the file must match its type, so a renamed file is rejected. */
export function looksValid(ext: string, buf: Buffer) {
  if (ext === ".pdf") return buf.subarray(0, 5).toString("latin1") === "%PDF-";
  return buf.length > 4 && buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04;
}

/** Only names this app generated are ever read from disk. */
export const STORED_RE = /^[a-f0-9-]{36}\.(pdf|docx|pptx|xlsx)$/;

export function storedPath(storedAs: string) {
  if (!STORED_RE.test(storedAs)) throw new Error("Bad file name");
  return path.join(STORAGE_DIR, storedAs);
}