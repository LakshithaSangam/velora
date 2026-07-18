import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { polishMeetingNotes } from "@/lib/ai/meeting-service";
import { notesToMarkdown } from "@/lib/utils/markdown";
import type { NotesResult } from "@/lib/ai/schemas/notes.schema";

export async function POST(_req: Request, ctx: { params: Promise<{ notesId: string }> }) {
  try {
    return await handlePOST(ctx);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handlePOST({ params }: { params: Promise<{ notesId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { notesId } = await params;
  const notesDoc = await prisma.notesDocument.findUnique({ where: { id: notesId }, include: { source: true } });
  if (!notesDoc || notesDoc.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (notesDoc.source.type !== "MEETING_RECORDING") {
    return NextResponse.json({ error: "Not a live meeting session." }, { status: 409 });
  }

  try {
    const current = (notesDoc.sectionsJson as unknown as NotesResult | null) ?? {
      title: notesDoc.title,
      summary: "",
      sections: [],
      confidenceScore: 100,
    };
    const { notes, model } = await polishMeetingNotes(current);
    const markdown = notesToMarkdown(notes);

    await prisma.$transaction([
      prisma.notesDocument.update({
        where: { id: notesId },
        data: { sectionsJson: notes as object, markdown, title: notes.title, model, status: "READY" },
      }),
      prisma.source.update({ where: { id: notesDoc.sourceId }, data: { status: "READY" } }),
    ]);

    return NextResponse.json({ id: notesId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not finalize this session.";
    await prisma.notesDocument.update({ where: { id: notesId }, data: { status: "FAILED", errorMessage: message } });
    await prisma.source.update({ where: { id: notesDoc.sourceId }, data: { status: "FAILED", errorMessage: message } });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
