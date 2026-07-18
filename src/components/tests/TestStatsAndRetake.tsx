"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TestConfigForm, type TestConfig } from "./TestConfigForm";
import { TestScoreChart, type PastAttempt } from "./TestScoreChart";

export type { PastAttempt };

export function TestStatsAndRetake({
  notesDocumentId,
  pastAttempts,
  readyToStartTest,
}: {
  notesDocumentId: string;
  pastAttempts: PastAttempt[];
  readyToStartTest?: { id: string; title: string } | null;
}) {
  const router = useRouter();
  const [retaking, setRetaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRetake(config: TestConfig) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/tests/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notesDocumentId, ...config }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Test generation failed.");
      router.push(`/tests/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-lg font-medium">Your stats on this topic</h1>

      {readyToStartTest && (
        <div className="flex items-center justify-between rounded-lg border border-[#d68989] bg-[#d68989]/10 px-4 py-3">
          <div>
            <div className="font-medium">A freshly generated test is ready</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{readyToStartTest.title}</div>
          </div>
          <Link
            href={`/tests/${readyToStartTest.id}/take`}
            className="shrink-0 rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Start test
          </Link>
        </div>
      )}

      <TestScoreChart pastAttempts={pastAttempts} />

      <details className="text-sm">
        <summary className="cursor-pointer text-gray-500 hover:text-black dark:hover:text-white">
          View as table
        </summary>
        <ul className="mt-2 divide-y divide-gray-200 dark:divide-gray-800">
          {pastAttempts.map((a) => {
            const pct = a.maxScore > 0 ? Math.round((a.score / a.maxScore) * 100) : 0;
            return (
              <li key={a.id} className="flex items-center justify-between py-2">
                <div>
                  <span className="font-medium">{a.testTitle}</span>
                  <span className="text-gray-500">
                    {" "}
                    · {a.questionStyle} · {a.requestedQuestionCount} questions
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">{new Date(a.submittedAt).toLocaleDateString()}</span>
                  <span className="font-semibold tabular-nums">
                    {Math.round(a.score * 10) / 10}/{a.maxScore} ({pct}%)
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </details>

      {retaking ? (
        <TestConfigForm
          onSubmit={handleRetake}
          loading={loading}
          error={error}
          showRepeatOption
          submitLabel="Generate retake"
        />
      ) : (
        <button
          type="button"
          onClick={() => setRetaking(true)}
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          🔁 Retake test
        </button>
      )}
    </div>
  );
}
