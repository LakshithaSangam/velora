import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile, unlink } from "fs/promises";
import path from "path";

// Local-disk storage for dev only. On a serverless deploy (Vercel etc.) the
// filesystem is ephemeral per invocation — swap this for Vercel Blob / S3
// before deploying (see BLOB_READ_WRITE_TOKEN in .env.example).
const UPLOAD_DIR = path.join(process.cwd(), ".uploads");

export async function saveUploadedFile(buffer: Buffer, originalName: string): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const safeExt = path.extname(originalName).replace(/[^a-zA-Z0-9.]/g, "");
  const fileKey = `${randomUUID()}${safeExt}`;
  await writeFile(path.join(UPLOAD_DIR, fileKey), buffer);
  return fileKey;
}

export async function readUploadedFile(fileKey: string): Promise<Buffer> {
  const safeName = path.basename(fileKey);
  return readFile(path.join(UPLOAD_DIR, safeName));
}

export async function deleteUploadedFile(fileKey: string): Promise<void> {
  const safeName = path.basename(fileKey);
  await unlink(path.join(UPLOAD_DIR, safeName)).catch(() => {
    // Already gone or never existed — deleting is idempotent either way.
  });
}
