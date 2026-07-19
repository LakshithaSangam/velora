import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string; attemptId: string }> }) {
  try {
    return await handleDELETE(ctx);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleDELETE({ params }: { params: Promise<{ id: string; attemptId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, attemptId } = await params;
  const attempt = await prisma.testAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.userId !== session.user.id || attempt.testId !== id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.testAttempt.delete({ where: { id: attemptId } });
  return NextResponse.json({ ok: true });
}
