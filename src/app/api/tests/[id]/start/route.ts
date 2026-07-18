import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    return await handlePOST(ctx);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handlePOST({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const test = await prisma.test.findUnique({ where: { id } });
  if (!test || test.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (test.status !== "READY" || !test.suggestedTimeLimitMin) {
    return NextResponse.json({ error: "Test is not ready to take." }, { status: 409 });
  }

  const attempt = await prisma.testAttempt.create({
    data: {
      testId: test.id,
      userId: session.user.id,
      timeLimitMinutes: test.suggestedTimeLimitMin,
      status: "IN_PROGRESS",
    },
  });

  return NextResponse.json({ attemptId: attempt.id, timeLimitMinutes: attempt.timeLimitMinutes });
}
