import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const test = await prisma.test.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!test || test.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Strip answer-key fields — this is consumed by the "take" screen before
  // submission. Only the results endpoint (after grading) includes them.
  const questions = test.questions.map((q) => ({
    id: q.id,
    order: q.order,
    type: q.type,
    promptText: q.promptText,
    options: q.options,
    points: q.points,
  }));

  return NextResponse.json({
    id: test.id,
    title: test.title,
    questionStyle: test.questionStyle,
    requestedQuestionCount: test.requestedQuestionCount,
    actualQuestionCount: test.actualQuestionCount,
    suggestedTimeLimitMin: test.suggestedTimeLimitMin,
    status: test.status,
    errorMessage: test.errorMessage,
    questions,
  });
}
