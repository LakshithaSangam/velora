import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile, unlink } from "fs/promises";
import path from "path";
import { put, del, get } from "@vercel/blob";

// Local disk works fine for dev, but a serverless deploy's filesystem is
// ephemeral per invocation, so uploads there go to Vercel Blob instead
// whenever a token is configured. The store is private (uploaded study
// material shouldn't be guessable/public via URL), which means reads need
// the SDK's authenticated get() rather than a plain fetch(). useBlob is
// fixed for the lifetime of a deployment, so fileKey can just be the bare
// pathname in both modes, no need to encode which backend wrote it.
const UPLOAD_DIR = path.join(process.cwd(), ".uploads");
const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

export async function saveUploadedFile(buffer: Buffer, originalName: string): Promise<string> {
  const safeExt = path.extname(originalName).replace(/[^a-zA-Z0-9.]/g, "");
  const fileKey = `${randomUUID()}${safeExt}`;

  if (useBlob) {
    await put(fileKey, buffer, { access: "private" });
    return fileKey;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, fileKey), buffer);
  return fileKey;
}

export async function readUploadedFile(fileKey: string): Promise<Buffer> {
  if (useBlob) {
    const result = await get(fileKey, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) {
      throw new Error("Uploaded file not found in storage.");
    }
    return Buffer.from(await new Response(result.stream).arrayBuffer());
  }
  const safeName = path.basename(fileKey);
  return readFile(path.join(UPLOAD_DIR, safeName));
}

export async function deleteUploadedFile(fileKey: string): Promise<void> {
  if (useBlob) {
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
