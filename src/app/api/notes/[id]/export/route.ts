import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
  if (format !== "markdown") {
    return NextResponse.json({ error: "Only markdown export is supported currently." }, { status: 400 });
  }

  const fileName = `${notes.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`;
  return new NextResponse(notes.markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
