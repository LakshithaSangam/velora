import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

const BodySchema = z.object({ consentConfirmed: z.literal(true) });

export async function POST(req: Request) {
  try {
    return await handlePOST(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handlePOST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "You must confirm the disclosure notice before starting a live session." },
      { status: 400 },
    );
  }

  const now = new Date();
  const title = `Live meeting — ${now.toLocaleString()}`;

  let source;
  try {
    source = await prisma.source.create({
      data: {
        userId: session.user.id,
        type: "MEETING_RECORDING",
        title,
        status: "INGESTING",
        consentConfirmedAt: now,
        confirmedAt: now,
      },
    });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2003") {
      return NextResponse.json(
        { error: "Your session is out of date — please sign out and sign back in." },
        { status: 401 },
      );
    }
    throw err;
  }

  const notesDoc = await prisma.notesDocument.create({
    data: {
      userId: session.user.id,
      sourceId: source.id,
      title,
      status: "GENERATING",
    },
  });

  return NextResponse.json({ sourceId: source.id, notesDocumentId: notesDoc.id });
}
