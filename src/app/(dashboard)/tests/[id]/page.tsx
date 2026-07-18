import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { TestStatsAndRetake, type PastAttempt } from "@/components/tests/TestStatsAndRetake";

const STYLE_LABEL: Record<string, string> = {
  MIXED: "Mixed",
  MCQ: "Multiple choice",
  SHORT_ANSWER: "Short answer",
};

export default async function TestOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const test = await prisma.test.findUnique({ where: { id } });

  if (!test || test.userId !== session!.user.id) notFound();

  if (test.status === "GENERATING") {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{test.title}</h1>
        <p className="text-gray-500">Generating your test... refresh in a moment.</p>
      </div>
    );
  }

  if (test.status === "FAILED") {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{test.title}</h1>
        <p className="text-red-600">Generation failed: {test.errorMessage}</p>
        <Link href="/tests/new" className="text-sm underline">
          Try again
        </Link>
      </div>
    );
  }

  // Whether to show the stats/retake view now depends on the whole topic
  // (every test sharing this notesDocumentId), not just this exact test —
  // otherwise generating a fresh retake right after finishing the last one
  // permanently hides your progress behind an unattempted "Start test"
  // screen. If this specific test hasn't been attempted yet, we still show
  // it as a clear "start this one" action inside the stats view rather than
  // making the user regenerate yet another retake to see it.
  const anyGradedInGroup = test.notesDocumentId
    ? await prisma.testAttempt.findFirst({
        where: {
          status: "GRADED",
          test: { notesDocumentId: test.notesDocumentId, userId: session!.user.id },
        },
      })
    : null;

  if (anyGradedInGroup && test.notesDocumentId) {
    const [attempts, ownAttemptCount] = await Promise.all([
      prisma.testAttempt.findMany({
        where: {
          status: "GRADED",
          test: { notesDocumentId: test.notesDocumentId, userId: session!.user.id },
        },
        include: { test: true },
        orderBy: { submittedAt: "desc" },
      }),
      prisma.testAttempt.count({ where: { testId: test.id, userId: session!.user.id } }),
    ]);
    const pastAttempts: PastAttempt[] = attempts
      .filter((a) => a.score !== null && a.maxScore !== null)
      .map((a) => ({
        id: a.id,
        score: a.score!,
        maxScore: a.maxScore!,
        submittedAt: a.submittedAt!.toISOString(),
        testTitle: a.test.title,
        questionStyle: a.test.questionStyle,
        requestedQuestionCount: a.test.requestedQuestionCount,
      }));

    return (
      <TestStatsAndRetake
        notesDocumentId={test.notesDocumentId}
        pastAttempts={pastAttempts}
        readyToStartTest={ownAttemptCount === 0 ? { id: test.id, title: test.title } : null}
      />
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{test.title}</h1>
        <p className="text-sm text-gray-500">generated with {test.model}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 rounded-lg border border-gray-200 p-5 dark:border-gray-800">
        <div className="min-w-0">
          <div className="text-2xl font-semibold">{test.actualQuestionCount}</div>
          <div className="text-sm text-gray-500">Questions</div>
        </div>
        <div className="min-w-0">
          <div className="truncate text-xl font-semibold">{STYLE_LABEL[test.questionStyle] ?? test.questionStyle}</div>
          <div className="text-sm text-gray-500">Style</div>
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-semibold">{test.suggestedTimeLimitMin} min</div>
          <div className="text-sm text-gray-500">Suggested time</div>
        </div>
      </div>

      <Link
        href={`/tests/${test.id}/take`}
        className="inline-block rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
      >
        Start test
      </Link>
    </div>
  );
}
