import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { generateTest } from "@/lib/ai/test-service";
import { estimateTimeLimitMinutes } from "@/lib/time-estimate";
import { MAX_QUESTION_COUNT, MIN_QUESTION_COUNT } from "@/lib/ai/models";

const BodySchema = z.object({
  notesDocumentId: z.string().min(1),
  questionStyle: z.enum(["MCQ", "SHORT_ANSWER", "MIXED"]),
  requestedQuestionCount: z.number().int().min(MIN_QUESTION_COUNT).max(MAX_QUESTION_COUNT),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { notesDocumentId, questionStyle, requestedQuestionCount } = parsed.data;

  const notesDoc = await prisma.notesDocument.findUnique({ where: { id: notesDocumentId } });
  if (!notesDoc || notesDoc.userId !== session.user.id) {
    return NextResponse.json({ error: "Notes document not found." }, { status: 404 });
  }
  if (notesDoc.status !== "READY" || !notesDoc.markdown) {
    return NextResponse.json({ error: "Notes document is not ready yet." }, { status: 409 });
  }

  const test = await prisma.test.create({
    data: {
      userId: session.user.id,
      title: notesDoc.title,
      testSourceType: "NOTES_DOCUMENT",
      notesDocumentId: notesDoc.id,
      questionStyle,
      requestedQuestionCount,
      status: "GENERATING",
    },
  });

  try {
    const { questions, model } = await generateTest(notesDoc.markdown, requestedQuestionCount, questionStyle);

    const suggestedTimeLimitMin = estimateTimeLimitMinutes(questions);

    await prisma.$transaction([
      ...questions.map((q, i) =>
        prisma.question.create({
          data: {
            testId: test.id,
            order: i,
            type: q.type,
            promptText: q.prompt,
            options: q.type === "MCQ" ? q.options : undefined,
            correctOptionIndex: q.type === "MCQ" ? q.correctOptionIndex : undefined,
            modelAnswer: q.type === "SHORT_ANSWER" ? q.modelAnswer : undefined,
          },
        }),
      ),
      prisma.test.update({
        where: { id: test.id },
        data: {
          status: "READY",
          model,
          actualQuestionCount: questions.length,
          suggestedTimeLimitMin,
        },
      }),
    ]);

    return NextResponse.json({ id: test.id, status: "READY" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Test generation failed.";
    await prisma.test.update({ where: { id: test.id }, data: { status: "FAILED", errorMessage: message } });
    return NextResponse.json({ error: message, testId: test.id }, { status: 502 });
  }
}
