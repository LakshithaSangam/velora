import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { ingestSource } from "@/lib/ingestion";
import { MAX_SOURCE_CHARS } from "@/lib/ai/models";
import { withTransientRetry } from "@/lib/db/retry";
import type { SourceType } from "@prisma/client";

const UrlBodySchema = z.object({
  type: z.enum(["WEB_ARTICLE", "YOUTUBE", "GENERIC_VIDEO"]),
  url: z.string().url(),
});

const PastedBodySchema = z.object({
  type: z.literal("PASTED_TRANSCRIPT"),
  pastedText: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    return await handlePOST(req);
  } catch (err) {
    // Safety net: any unexpected failure (auth, DB connection hiccup, etc.)
    // before the specific try/catch blocks below still returns JSON instead
    // of Next.js's HTML error page, which breaks res.json() on the client.
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handlePOST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = req.headers.get("content-type") ?? "";
  let type: SourceType;
  let ingestInput: { url?: string; fileBuffer?: Buffer; fileName?: string; pastedText?: string };
  let originalUrl: string | undefined;
  let fileName: string | undefined;

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const formType = form.get("type");
    if (formType !== "PDF" && formType !== "MEDIA_UPLOAD" && formType !== "DOCUMENT_UPLOAD") {
      return NextResponse.json(
        { error: "Only PDF, audio/video, and Word/Excel uploads use multipart requests." },
        { status: 400 },
      );
    }
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (formType === "PDF") {
      if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
      }
      type = "PDF";
    } else if (formType === "MEDIA_UPLOAD") {
      const ALLOWED_MEDIA_TYPES = [
        "audio/flac",
        "audio/mpeg",
        "audio/mp4",
        "video/mp4",
        "audio/mpga",
        "audio/m4a",
        "audio/ogg",
        "audio/wav",
        "audio/x-wav",
        "audio/webm",
        "video/webm",
      ];
      if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "Unsupported file type. Use mp3, mp4, m4a, wav, ogg, webm, or flac." },
          { status: 400 },
        );
      }
      type = "MEDIA_UPLOAD";
    } else {
      const ALLOWED_DOCUMENT_TYPES = [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      ];
      if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "Unsupported file type. Use a .docx (Word) or .xlsx (Excel) file." },
          { status: 400 },
        );
      }
      type = "DOCUMENT_UPLOAD";
    }
    fileName = file.name;
    const arrayBuffer = await file.arrayBuffer();
    ingestInput = { fileBuffer: Buffer.from(arrayBuffer), fileName };
  } else {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

    if (body.type === "PASTED_TRANSCRIPT") {
      const parsed = PastedBodySchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
      }
      type = "PASTED_TRANSCRIPT";
      ingestInput = { pastedText: parsed.data.pastedText };
    } else {
      const parsed = UrlBodySchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
      }
      type = parsed.data.type;
      originalUrl = parsed.data.url;
      ingestInput = { url: parsed.data.url };
    }
  }

  let source;
  try {
    source = await withTransientRetry(() =>
      prisma.source.create({
        data: {
          userId: session.user.id,
          type,
          originalUrl,
          status: "INGESTING",
        },
      }),
    );
  } catch (err) {
    // A genuine foreign key violation on userId (surviving a retry) means
    // the session references a user that no longer exists in the database
    // (e.g. after a DB reset/switch).
    if (err && typeof err === "object" && "code" in err && err.code === "P2003") {
      return NextResponse.json(
        { error: "Your session is out of date, please sign out and sign back in." },
        { status: 401 },
      );
    }
    return NextResponse.json({ error: "Could not create source." }, { status: 500 });
  }

  try {
    const result = await ingestSource(type, ingestInput);
    const truncatedText = result.rawText.slice(0, MAX_SOURCE_CHARS);

    const updated = await prisma.source.update({
      where: { id: source.id },
      data: {
        title: result.title,
        rawText: truncatedText,
        fileKey: "fileKey" in result ? (result.fileKey as string) : undefined,
        metadata: result.sourceMeta as object,
        status: "PENDING_CONFIRMATION",
      },
    });

    return NextResponse.json({
      id: updated.id,
      type: updated.type,
      title: updated.title,
      status: updated.status,
      rawTextPreview: (updated.rawText ?? "").slice(0, 2000),
      metadata: updated.metadata,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ingestion failed.";
    await prisma.source.update({
      where: { id: source.id },
      data: { status: "FAILED", errorMessage: message },
    });
    return NextResponse.json({ error: message, sourceId: source.id }, { status: 422 });
  }
}
