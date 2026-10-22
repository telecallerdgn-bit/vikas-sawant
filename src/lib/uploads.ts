import path from "node:path";

/**
 * Folder where uploaded images are stored.
 * In production set UPLOAD_DIR in .env to a folder outside the app,
 * so a redeploy never deletes the images.
 */
export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "storage", "uploads");