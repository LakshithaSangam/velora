import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

type Resolved = { status: "missing" } | { status: "not_found" } | { status: "ok"; notesDocumentId: string | null };

// A conversation can be reached from a notes document directly, or from a
// test that was generated from one — both cases resolve down to the same
// notesDocumentId, since that's what messages are actually saved under.
async function resolveNotesDocumentId(req: Request, userId: string): Promise<Resolved> {
  const { searchParams } = new URL(req.url);
  const notesId = searchParams.get("notesId");
  const testId = searchParams.get("testId");

  if (notesId) {
    const notesDoc = await prisma.notesDocument.findUnique({ where: { id: notesId }, select: { userId: true } });
    if (!notesDoc || notesDoc.userId !== userId) return { status: "not_found" };
    return { status: "ok", notesDocumentId: notesId };
  }
  if (testId) {
    const test = await prisma.test.findUnique({ where: { id: testId }, select: { userId: true, notesDocumentId: true } });
    if (!test || test.userId !== userId) return { status: "not_found" };
    return { status: "ok", notesDocumentId: test.notesDocumentId };
  }
  return { status: "missing" };
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolved = await resolveNotesDocumentId(req, session.user.id);
  if (resolved.status === "missing") return NextResponse.json({ error: "Missing notesId or testId." }, { status: 400 });
  if (resolved.status === "not_found") return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!resolved.notesDocumentId) return NextResponse.json({ messages: [], notesDocumentId: null });

  const messages = await prisma.askVeloraMessage.findMany({
    where: { notesDocumentId: resolved.notesDocumentId, userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    notesDocumentId: resolved.notesDocumentId,
    messages: messages.map((m) => ({
      from: m.role === "USER" ? "user" : "assistant",
      text: m.text,
      flashcards: m.flashcardsJson ?? undefined,
    })),
  });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolved = await resolveNotesDocumentId(req, session.user.id);
  if (resolved.status === "missing") return NextResponse.json({ error: "Missing notesId or testId." }, { status: 400 });
  if (resolved.status === "not_found") return NextResponse.json({ error: "Not found." }, { status: 404 });

  if (resolved.notesDocumentId) {
    await prisma.askVeloraMessage.deleteMany({
      where: { notesDocumentId: resolved.notesDocumentId, userId: session.user.id },
    });
  }

  return NextResponse.json({ ok: true });
}
