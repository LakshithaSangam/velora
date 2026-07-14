import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

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

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{test.title}</h1>
        <p className="text-sm text-gray-500">generated with {test.model}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 rounded-lg border border-gray-200 p-5 dark:border-gray-800">
        <div>
          <div className="text-2xl font-semibold">{test.actualQuestionCount}</div>
          <div className="text-sm text-gray-500">Questions</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{test.questionStyle}</div>
          <div className="text-sm text-gray-500">Style</div>
        </div>
        <div>
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
