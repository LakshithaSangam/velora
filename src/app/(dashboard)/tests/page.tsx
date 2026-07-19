import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { withMinDelay } from "@/lib/utils/min-delay";
import { DeleteItemButton } from "@/components/DeleteItemButton";

const STYLE_LABEL: Record<string, string> = {
  MIXED: "Mixed",
  MCQ: "Multiple choice",
  SHORT_ANSWER: "Short answer",
};

export default async function TestsListPage() {
  const session = await auth();
  const tests = await withMinDelay(
    prisma.test.findMany({
      where: { userId: session!.user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { attempts: true } } },
    }),
  );

  // Retaking a topic generates a fresh Test row (it has its own newly
  // generated questions), but from the user's point of view it's the same
  // topic, not a new project — so group retakes by notesDocumentId here and
  // show one row per topic, with individual generations tucked into an
  // expandable list rather than cluttering the main view.
  //
  // notesDocumentId is nulled out automatically if the source notes
  // document was later deleted (it's an optional foreign key), which would
  // otherwise silently break grouping for every test generated from it —
  // fall back to matching by title so those still group sensibly instead
  // of each becoming its own ungrouped row.
  const groups = new Map<string, typeof tests>();
  for (const t of tests) {
    const key = t.notesDocumentId ?? `title:${t.title}`;
    const group = groups.get(key);
    if (group) group.push(t);
    else groups.set(key, [t]);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">🧪 Tests</h1>
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
          {[...groups.values()].map((group) => {
            const latest = group[0];
            const totalAttempts = group.reduce((sum, t) => sum + t._count.attempts, 0);

            return (
              <li key={latest.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Link href={`/tests/${latest.id}`} className="font-medium hover:underline">
                      {latest.title}
                    </Link>
                    <div className="text-sm text-gray-500">
                      {STYLE_LABEL[latest.questionStyle] ?? latest.questionStyle} · {latest.requestedQuestionCount}{" "}
                      questions · {latest.status}
                      {group.length > 1 && ` · ${group.length} retakes`}
                      {totalAttempts > 0 && ` · ${totalAttempts} attempt${totalAttempts === 1 ? "" : "s"}`}
                    </div>
                  </div>
                  {group.length === 1 ? (
                    <DeleteItemButton
                      deleteUrl={`/api/tests/${latest.id}`}
                      confirmMessage={`Delete "${latest.title}"? This can't be undone.`}
                    />
                  ) : (
                    <DeleteItemButton
                      deleteUrl={group.map((t) => `/api/tests/${t.id}`)}
                      confirmMessage={`Delete all ${group.length} versions of "${latest.title}" and their ${totalAttempts} attempt${totalAttempts === 1 ? "" : "s"}? This can't be undone.`}
                      label="Delete all"
                    />
                  )}
                </div>

                {group.length > 1 && (
                  <details className="mt-2 text-sm">
                    <summary className="cursor-pointer text-gray-500 hover:text-black dark:hover:text-white">
                      View {group.length} versions
                    </summary>
                    <ul className="mt-2 space-y-2 border-l border-gray-200 pl-3 dark:border-gray-800">
                      {group.map((t) => (
                        <li key={t.id} className="flex items-center justify-between gap-3">
                          <Link href={`/tests/${t.id}`} className="text-gray-600 hover:underline dark:text-gray-400">
                            {STYLE_LABEL[t.questionStyle] ?? t.questionStyle} · {t.requestedQuestionCount} questions ·{" "}
                            {t.createdAt.toLocaleDateString("en-US")}
                          </Link>
                          <DeleteItemButton
                            deleteUrl={`/api/tests/${t.id}`}
                            confirmMessage={`Delete this version of "${t.title}"? This can't be undone.`}
                          />
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
