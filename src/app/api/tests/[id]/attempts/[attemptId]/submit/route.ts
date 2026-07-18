import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { gradeShortAnswers } from "@/lib/ai/grading-service";

const BodySchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOptionIndex: z.number().int().min(0).max(3).optional(),
      userAnswerText: z.string().optional(),
    }),
  ),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string; attemptId: string }> },
) {
  try {
    return await handlePOST(req, ctx);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handlePOST(
  req: Request,
  { params }: { params: Promise<{ id: string; attemptId: string }> },
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: testId, attemptId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const attempt = await prisma.testAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.userId !== session.user.id || attempt.testId !== testId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (attempt.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "This attempt has already been submitted." }, { status: 409 });
  }

  const questions = await prisma.question.findMany({ where: { testId } });
  const questionById = new Map(questions.map((q) => [q.id, q]));
  const answerByQuestionId = new Map(parsed.data.answers.map((a) => [a.questionId, a]));

  // MCQ: grade synchronously, no LLM call.
  const mcqResults: { questionId: string; selectedOptionIndex: number | null; isCorrect: boolean }[] = [];
  for (const q of questions) {
    if (q.type !== "MCQ") continue;
    const submitted = answerByQuestionId.get(q.id)?.selectedOptionIndex ?? null;
    mcqResults.push({
      questionId: q.id,
      selectedOptionIndex: submitted,
      isCorrect: submitted !== null && submitted === q.correctOptionIndex,
    });
  }

  // Short answer: one batched Gemini call for the whole attempt.
  const shortAnswerQuestions = questions.filter((q) => q.type === "SHORT_ANSWER");
  const shortAnswerInputs = shortAnswerQuestions.map((q) => ({
    questionId: q.id,
    answerText: answerByQuestionId.get(q.id)?.userAnswerText ?? "",
  }));

  let gradingResults: { questionId: string; score: number; feedback: string }[] = [];
  if (shortAnswerQuestions.length > 0) {
    try {
      gradingResults = await gradeShortAnswers(
        shortAnswerQuestions.map((q) => ({
          questionId: q.id,
          prompt: q.promptText,
          modelAnswer: q.modelAnswer ?? "",
        })),
        shortAnswerInputs,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Grading failed.";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }
  const gradingByQuestionId = new Map(gradingResults.map((r) => [r.questionId, r]));

  let score = 0;
  const maxScore = questions.reduce((sum, q) => sum + q.points, 0);

  await prisma.$transaction([
    ...mcqResults.map((r) => {
      const q = questionById.get(r.questionId)!;
      score += r.isCorrect ? q.points : 0;
      return prisma.answer.create({
        data: {
          testAttemptId: attemptId,
          questionId: r.questionId,
          selectedOptionIndex: r.selectedOptionIndex,
          isCorrect: r.isCorrect,
          gradedAt: new Date(),
        },
      });
    }),
    ...shortAnswerQuestions.map((q) => {
      const grading = gradingByQuestionId.get(q.id);
      const gradedScore = grading?.score ?? 0;
      score += gradedScore * q.points;
      return prisma.answer.create({
        data: {
          testAttemptId: attemptId,
          questionId: q.id,
          userAnswerText: answerByQuestionId.get(q.id)?.userAnswerText ?? "",
          gradedScore,
          gradingFeedback: grading?.feedback ?? "Grading unavailable.",
          gradedAt: new Date(),
        },
      });
    }),
    prisma.testAttempt.update({
      where: { id: attemptId },
      data: { status: "GRADED", submittedAt: new Date(), score, maxScore },
    }),
  ]);

  return NextResponse.json({ attemptId, score, maxScore });
}
