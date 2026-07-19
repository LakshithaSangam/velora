import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile, unlink } from "fs/promises";
import path from "path";
import { put, del } from "@vercel/blob";

// Local disk works fine for dev, but a serverless deploy's filesystem is
// ephemeral per invocation, so uploads there go to Vercel Blob instead
// whenever a token is configured. The fileKey doubles as the mode switch: a
// Blob fileKey is the blob's own https:// URL, a local one is just a
// filename, so read/delete can tell which backend wrote it without a
// separate flag.
const UPLOAD_DIR = path.join(process.cwd(), ".uploads");
const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

export async function saveUploadedFile(buffer: Buffer, originalName: string): Promise<string> {
  const safeExt = path.extname(originalName).replace(/[^a-zA-Z0-9.]/g, "");
  const fileKey = `${randomUUID()}${safeExt}`;

  if (useBlob) {
    const blob = await put(fileKey, buffer, { access: "public" });
    return blob.url;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, fileKey), buffer);
  return fileKey;
}

export async function readUploadedFile(fileKey: string): Promise<Buffer> {
  if (fileKey.startsWith("http")) {
    const res = await fetch(fileKey);
    return Buffer.from(await res.arrayBuffer());
  }
  const safeName = path.basename(fileKey);
  return readFile(path.join(UPLOAD_DIR, safeName));
}

export async function deleteUploadedFile(fileKey: string): Promise<void> {
  if (fileKey.startsWith("http")) {
    await del(fileKey).catch(() => {
      // Already gone or never existed — deleting is idempotent either way.
    });
    return;
  }
  const safeName = path.basename(fileKey);
  await unlink(path.join(UPLOAD_DIR, safeName)).catch(() => {
    // Already gone or never existed — deleting is idempotent either way.
  });
}
