import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { ingestSource } from "@/lib/ingestion";
import { MAX_SOURCE_CHARS } from "@/lib/ai/models";
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
    if (formType !== "PDF") {
      return NextResponse.json({ error: "Only PDF uploads use multipart requests." }, { status: 400 });
    }
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
    }
    type = "PDF";
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
    source = await prisma.source.create({
      data: {
        userId: session.user.id,
        type,
        originalUrl,
        status: "INGESTING",
      },
    });
  } catch (err) {
    // Foreign key violation on userId means the session references a user
    // that no longer exists in the database (e.g. after a DB reset/switch).
    if (err && typeof err === "object" && "code" in err && err.code === "P2003") {
      return NextResponse.json(
        { error: "Your session is out of date — please sign out and sign back in." },
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
