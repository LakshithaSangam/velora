import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { generateNotesFromPdf, generateNotesFromText } from "@/lib/ai/notes-service";
import { notesToMarkdown } from "@/lib/utils/markdown";
import { readUploadedFile } from "@/lib/storage/files";

const BodySchema = z.object({ sourceId: z.string().min(1) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "sourceId is required." }, { status: 400 });
  }

  const source = await prisma.source.findUnique({ where: { id: parsed.data.sourceId } });
  if (!source || source.userId !== session.user.id) {
    return NextResponse.json({ error: "Source not found." }, { status: 404 });
  }
  if (source.status !== "PENDING_CONFIRMATION") {
    return NextResponse.json({ error: `Source is not ready for generation (status: ${source.status}).` }, { status: 409 });
  }

  await prisma.source.update({ where: { id: source.id }, data: { confirmedAt: new Date() } });

  const notesDoc = await prisma.notesDocument.create({
    data: {
      userId: session.user.id,
      sourceId: source.id,
      title: source.title ?? "Untitled",
      status: "GENERATING",
    },
  });

  try {
    const meta = (source.metadata as Record<string, unknown>) ?? {};
    const { notes, model } =
      source.type === "PDF" && source.fileKey
        ? await generateNotesFromPdf((await readUploadedFile(source.fileKey)).toString("base64"), meta)
        : await generateNotesFromText(source.rawText ?? "", meta);

    const markdown = notesToMarkdown(notes);

    const updated = await prisma.notesDocument.update({
      where: { id: notesDoc.id },
      data: {
        title: notes.title,
        sectionsJson: notes as object,
        markdown,
        model,
        status: "READY",
      },
    });

    return NextResponse.json({ id: updated.id, status: updated.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Notes generation failed.";
    await prisma.notesDocument.update({
      where: { id: notesDoc.id },
      data: { status: "FAILED", errorMessage: message },
    });
    return NextResponse.json({ error: message, notesDocumentId: notesDoc.id }, { status: 502 });
  }
}
