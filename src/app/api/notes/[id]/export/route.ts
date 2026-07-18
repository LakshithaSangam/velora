import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { notesToDocxBuffer } from "@/lib/utils/docx-export";
import type { NotesResult } from "@/lib/ai/schemas/notes.schema";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    return await handleGET(req, ctx);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleGET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const notes = await prisma.notesDocument.findUnique({ where: { id } });
  if (!notes || notes.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!notes.markdown) {
    return NextResponse.json({ error: "Notes are not ready yet." }, { status: 409 });
  }

  const format = new URL(req.url).searchParams.get("format") ?? "markdown";
  const baseFileName = notes.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

  if (format === "docx") {
    const buffer = await notesToDocxBuffer(notes.sectionsJson as unknown as NotesResult);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${baseFileName}.docx"`,
      },
    });
  }

  if (format !== "markdown") {
    return NextResponse.json({ error: "Unsupported export format." }, { status: 400 });
  }

  return new NextResponse(notes.markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${baseFileName}.md"`,
    },
  });
}
