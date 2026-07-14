import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export default async function TestsListPage() {
  const session = await auth();
  const tests = await prisma.test.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tests</h1>
        <Link
          href="/tests/new"
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          + New test
        </Link>
      </div>

      {tests.length === 0 ? (
        <p className="text-gray-500">No tests yet. Generate one from your notes.</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {tests.map((t) => (
            <li key={t.id} className="py-3">
              <Link href={`/tests/${t.id}`} className="font-medium hover:underline">
                {t.title}
              </Link>
              <div className="text-sm text-gray-500">
                {t.questionStyle} · {t.requestedQuestionCount} questions · {t.status}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
