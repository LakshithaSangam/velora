import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { askVelora } from "@/lib/ai/ask-velora-service";

const MAX_HISTORY_MESSAGES = 10;

const BodySchema = z.object({
  message: z.string().min(1).max(2000),
  notesId: z.string().optional(),
  testId: z.string().optional(),
  attemptId: z.string().optional(),
  history: z
    .array(z.object({ from: z.enum(["user", "assistant"]), text: z.string() }))
    .optional()
    .default([]),
});

type AttemptForContext = {
  test: { title: string };
  score: number | null;
  maxScore: number | null;
  answers: {
    isCorrect: boolean | null;
    selectedOptionIndex: number | null;
    gradedScore: number | null;
    userAnswerText: string | null;
    gradingFeedback: string | null;
    question: {
      type: string;
      promptText: string;
      options: unknown;
      correctOptionIndex: number | null;
      modelAnswer: string | null;
    };
  }[];
};

function formatAttemptContext(attempt: AttemptForContext): string {
  const lines = attempt.answers.map((a, i) => {
    const q = a.question;
    if (q.type === "MCQ") {
      const options = (q.options as string[] | null) ?? [];
      const correctAnswer = q.correctOptionIndex !== null ? options[q.correctOptionIndex] : "unknown";
      const studentAnswer =
        a.selectedOptionIndex !== null && a.selectedOptionIndex !== undefined
          ? options[a.selectedOptionIndex]
          : "(no answer)";
      return `${i + 1}. [${a.isCorrect ? "Correct" : "Incorrect"}] ${q.promptText}\n   Correct answer: ${correctAnswer}\n   Student's answer: ${studentAnswer}`;
    }
    const scorePct = a.gradedScore !== null ? Math.round(a.gradedScore * 100) : null;
    return `${i + 1}. [${scorePct !== null ? `${scorePct}% correct` : "Ungraded"}] ${q.promptText}\n   Model answer: ${q.modelAnswer ?? "n/a"}\n   Student's answer: ${a.userAnswerText || "(no answer)"}${a.gradingFeedback ? `\n   Feedback given: ${a.gradingFeedback}` : ""}`;
  });
  return `Test: "${attempt.test.title}", scored ${attempt.score}/${attempt.maxScore}.\n\n${lines.join("\n\n")}`;
}

const attemptInclude = {
  test: true,
  answers: { include: { question: true }, orderBy: { question: { order: "asc" as const } } },
};

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
  const { message, notesId, testId, attemptId, history } = parsed.data;

  let notesContext: string | null = null;
  let ownedNotesId: string | null = null;

  if (notesId) {
    const notesDoc = await prisma.notesDocument.findUnique({
      where: { id: notesId },
      select: { userId: true, markdown: true },
    });
    if (notesDoc && notesDoc.userId === session.user.id) {
      notesContext = notesDoc.markdown ?? null;
      ownedNotesId = notesId;
    }
  } else if (testId) {
    // A test is grounded in the same notes document it was generated from
    // (if any), so chatting from a test page uses that notes content and
    // saves into the same conversation as chatting from the notes page
    // itself, one continuous thread per topic rather than a separate one
    // per test.
    const test = await prisma.test.findUnique({
      where: { id: testId },
      select: { userId: true, notesDocumentId: true },
    });
    if (test && test.userId === session.user.id && test.notesDocumentId) {
      const notesDoc = await prisma.notesDocument.findUnique({
        where: { id: test.notesDocumentId },
        select: { markdown: true },
      });
      notesContext = notesDoc?.markdown ?? null;
      ownedNotesId = test.notesDocumentId;
    }
  }

  // Attempt mistakes are part of the same per-topic thread, not just
  // something available on the exact results page URL. Prefer the specific
  // attempt being viewed (if any); otherwise fall back to the most recent
  // graded attempt for this topic, so "what did I get wrong" also works
  // from the notes page or the test's own overview page.
  let attemptContext: string | null = null;
  if (ownedNotesId) {
    let attempt: AttemptForContext | null = null;
    if (attemptId && testId) {
      const candidate = await prisma.testAttempt.findUnique({
        where: { id: attemptId },
        include: attemptInclude,
      });
      if (
        candidate &&
        candidate.userId === session.user.id &&
        candidate.testId === testId &&
        candidate.status === "GRADED"
      ) {
        attempt = candidate;
      }
    }
    if (!attempt) {
      attempt = await prisma.testAttempt.findFirst({
        where: { status: "GRADED", userId: session.user.id, test: { notesDocumentId: ownedNotesId } },
        orderBy: { submittedAt: "desc" },
        include: attemptInclude,
      });
    }
    if (attempt) {
      attemptContext = formatAttemptContext(attempt);
    }
  }

  const result = await askVelora({
    notesContext,
    attemptContext,
    history: history.slice(-MAX_HISTORY_MESSAGES),
    message,
  });

  if (ownedNotesId) {
    await prisma.askVeloraMessage.createMany({
      data: [
        { notesDocumentId: ownedNotesId, userId: session.user.id, role: "USER", text: message },
        {
          notesDocumentId: ownedNotesId,
          userId: session.user.id,
          role: "ASSISTANT",
          text: result.reply,
          flashcardsJson: result.flashcards ?? undefined,
        },
      ],
    });
  }

  return NextResponse.json(result);
}
