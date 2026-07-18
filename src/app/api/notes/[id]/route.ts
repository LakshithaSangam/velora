import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { deleteUploadedFile } from "@/lib/storage/files";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    return await handleGET(ctx);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleGET({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const notes = await prisma.notesDocument.findUnique({ where: { id }, include: { source: true } });
  if (!notes || notes.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(notes);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    return await handleDELETE(ctx);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleDELETE({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const notes = await prisma.notesDocument.findUnique({ where: { id }, include: { source: true } });
  if (!notes || notes.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Deleting the Source cascades to delete this NotesDocument too (see
  // schema), so this also cleans up the raw source text in one go.
  await prisma.source.delete({ where: { id: notes.sourceId } });
  if (notes.source.fileKey) {
    await deleteUploadedFile(notes.source.fileKey);
  }

  return NextResponse.json({ ok: true });
}
