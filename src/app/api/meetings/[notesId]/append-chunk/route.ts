import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { mergeMeetingChunk } from "@/lib/ai/meeting-service";
import { notesToMarkdown } from "@/lib/utils/markdown";
import type { NotesResult } from "@/lib/ai/schemas/notes.schema";
import { MAX_SOURCE_CHARS } from "@/lib/ai/models";

const BodySchema = z.object({ transcriptChunk: z.string().min(1) });

export async function POST(req: Request, ctx: { params: Promise<{ notesId: string }> }) {
  try {
    return await handlePOST(req, ctx);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handlePOST(req: Request, { params }: { params: Promise<{ notesId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { notesId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "transcriptChunk is required." }, { status: 400 });

  const notesDoc = await prisma.notesDocument.findUnique({ where: { id: notesId }, include: { source: true } });
  if (!notesDoc || notesDoc.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (notesDoc.source.type !== "MEETING_RECORDING" || notesDoc.status !== "GENERATING") {
    return NextResponse.json({ error: "This session is not accepting live updates." }, { status: 409 });
  }

  try {
    const existing = notesDoc.sectionsJson as unknown as NotesResult | null;
    const { notes } = await mergeMeetingChunk(existing, parsed.data.transcriptChunk);
    const markdown = notesToMarkdown(notes);
    const appendedRawText = `${notesDoc.source.rawText ?? ""}\n\n${parsed.data.transcriptChunk}`.trim();

    await prisma.$transaction([
      prisma.notesDocument.update({
        where: { id: notesId },
        data: { sectionsJson: notes as object, markdown, title: notes.title },
      }),
      prisma.source.update({
        where: { id: notesDoc.sourceId },
        data: { rawText: appendedRawText.slice(0, MAX_SOURCE_CHARS) },
      }),
    ]);

    return NextResponse.json({ notes });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not process this chunk.";
    // Don't fail the whole session over one bad chunk — the live session keeps running,
    // the client can just retry the next chunk.
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
