import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { TestStatsAndRetake, type PastAttempt } from "@/components/tests/TestStatsAndRetake";
import { DeleteItemButton } from "@/components/DeleteItemButton";

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

  // Every test sharing this notesDocumentId is the same "topic" — but that
  // link is nulled out automatically if the source notes document was later
  // deleted (it's an optional foreign key), which would otherwise silently
  // orphan every test generated from it. Fall back to matching by title so
  // those still find their siblings, same as the /tests list page does.
  const siblingWhere = test.notesDocumentId
    ? { notesDocumentId: test.notesDocumentId, userId: session!.user.id }
    : { notesDocumentId: null, title: test.title, userId: session!.user.id };

  const siblings = await prisma.test.findMany({
    where: siblingWhere,
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { attempts: true } } },
  });
  const versions = siblings.map((t, i) => ({
    id: t.id,
    version: i + 1,
    questionStyle: t.questionStyle,
    requestedQuestionCount: t.requestedQuestionCount,
    createdAt: t.createdAt,
    attemptCount: t._count.attempts,
  }));

  const versionsList = versions.length > 1 && (
    <div>
      <h2 className="mb-2 text-sm font-medium text-gray-500">All versions of this test</h2>
      <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
        {versions.map((v) => (
          <li
            key={v.id}
            className={`flex items-center justify-between gap-3 px-4 py-2 text-sm ${
              v.id === test.id ? "bg-gray-50 dark:bg-gray-900" : ""
            }`}
          >
            <Link href={`/tests/${v.id}`} className="hover:underline">
              <span className="font-medium">#{v.version}</span> {STYLE_LABEL[v.questionStyle] ?? v.questionStyle} ·{" "}
              {v.requestedQuestionCount} questions · {v.createdAt.toLocaleDateString("en-US")}
              {v.id === test.id && <span className="ml-2 text-xs text-gray-400">(viewing)</span>}
            </Link>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-xs text-gray-400">
                {v.attemptCount > 0 ? `${v.attemptCount} attempt${v.attemptCount === 1 ? "" : "s"}` : "not attempted"}
              </span>
              <DeleteItemButton
                deleteUrl={`/api/tests/${v.id}`}
                confirmMessage={`Delete version #${v.version} of "${test.title}"? This can't be undone.`}
                redirectTo={v.id === test.id ? "/tests" : undefined}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  // Whether to show the stats/retake view now depends on the whole topic
  // (every sibling test), not just this exact test — otherwise generating a
  // fresh retake right after finishing the last one permanently hides your
  // progress behind an unattempted "Start test" screen. If this specific
  // test hasn't been attempted yet, we still show it as a clear "start this
  // one" action inside the stats view rather than making the user
  // regenerate yet another retake to see it.
  const anyGradedInGroup = await prisma.testAttempt.findFirst({
    where: { status: "GRADED", test: siblingWhere },
  });

  if (anyGradedInGroup) {
    const [attempts, ownAttemptCount] = await Promise.all([
      prisma.testAttempt.findMany({
        where: { status: "GRADED", test: siblingWhere },
        include: { test: true },
        orderBy: { submittedAt: "desc" },
      }),
      prisma.testAttempt.count({ where: { testId: test.id, userId: session!.user.id } }),
    ]);
    const pastAttempts: PastAttempt[] = attempts
      .filter((a) => a.score !== null && a.maxScore !== null)
      .map((a) => ({
        id: a.id,
        testId: a.testId,
        score: a.score!,
        maxScore: a.maxScore!,
        submittedAt: a.submittedAt!.toISOString(),
        testTitle: a.test.title,
        questionStyle: a.test.questionStyle,
        requestedQuestionCount: a.test.requestedQuestionCount,
      }));

    return (
      <div className="max-w-2xl space-y-6">
        <TestStatsAndRetake
          notesDocumentId={test.notesDocumentId}
          pastAttempts={pastAttempts}
          readyToStartTest={ownAttemptCount === 0 ? { id: test.id, title: test.title } : null}
        />
        {versionsList}
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{test.title}</h1>
          <p className="text-sm text-gray-500">generated with {test.model}</p>
        </div>
        <DeleteItemButton
          deleteUrl={`/api/tests/${test.id}`}
          confirmMessage={`Delete "${test.title}"? This can't be undone.`}
          redirectTo="/tests"
        />
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

      {versionsList}
    </div>
  );
}
