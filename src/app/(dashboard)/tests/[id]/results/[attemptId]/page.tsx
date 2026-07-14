import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string; attemptId: string }>;
}) {
  const { id: testId, attemptId } = await params;
  const session = await auth();

  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
    include: {
      test: true,
      answers: { include: { question: true }, orderBy: { question: { order: "asc" } } },
    },
  });

  if (!attempt || attempt.userId !== session!.user.id || attempt.testId !== testId) notFound();
  if (attempt.status !== "GRADED") {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{attempt.test.title}</h1>
        <p className="text-gray-500">This attempt hasn&apos;t been graded yet.</p>
      </div>
    );
  }

  const scorePct = attempt.maxScore ? Math.round(((attempt.score ?? 0) / attempt.maxScore) * 100) : 0;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{attempt.test.title} — Results</h1>
        <p className="text-lg font-medium">
          {attempt.score?.toFixed(1)} / {attempt.maxScore} ({scorePct}%)
        </p>
      </div>

      <div className="space-y-6">
        {attempt.answers.map((answer, i) => (
          <div key={answer.id} className="space-y-2 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <p className="font-medium">
              {i + 1}. {answer.question.promptText}
            </p>

            {answer.question.type === "MCQ" ? (
              <div className="space-y-1 text-sm">
                {(answer.question.options as string[] | null)?.map((opt, oi) => (
                  <p
                    key={oi}
                    className={
                      oi === answer.question.correctOptionIndex
                        ? "font-medium text-green-700 dark:text-green-400"
                        : oi === answer.selectedOptionIndex
                          ? "font-medium text-red-700 dark:text-red-400"
                          : "text-gray-600 dark:text-gray-400"
                    }
                  >
                    {oi === answer.question.correctOptionIndex ? "✓ " : oi === answer.selectedOptionIndex ? "✗ " : "  "}
                    {opt}
                  </p>
                ))}
              </div>
            ) : (
              <div className="space-y-1 text-sm">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="text-gray-500">Your answer: </span>
                  {answer.userAnswerText || "(no answer)"}
                </p>
                <p className="text-gray-500">
                  Score: {((answer.gradedScore ?? 0) * 100).toFixed(0)}%
                </p>
                {answer.gradingFeedback && <p className="text-gray-600 dark:text-gray-400">{answer.gradingFeedback}</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      <Link href="/tests" className="inline-block text-sm underline">
        Back to tests
      </Link>
    </div>
  );
}
