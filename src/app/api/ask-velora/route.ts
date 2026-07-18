import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { askVelora } from "@/lib/ai/ask-velora-service";

const MAX_HISTORY_MESSAGES = 10;

const BodySchema = z.object({
  message: z.string().min(1).max(2000),
  notesId: z.string().optional(),
  history: z
    .array(z.object({ from: z.enum(["user", "assistant"]), text: z.string() }))
    .optional()
    .default([]),
});

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
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { message, notesId, history } = parsed.data;

  let notesContext: string | null = null;
  if (notesId) {
    const notesDoc = await prisma.notesDocument.findUnique({
      where: { id: notesId },
      select: { userId: true, markdown: true },
    });
    if (notesDoc && notesDoc.userId === session.user.id) {
      notesContext = notesDoc.markdown ?? null;
    }
  }

  const result = await askVelora({
    notesContext,
    history: history.slice(-MAX_HISTORY_MESSAGES),
    message,
  });

  return NextResponse.json(result);
}
