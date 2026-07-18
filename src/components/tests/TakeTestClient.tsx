"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TestTimer } from "./TestTimer";
import { McqQuestion } from "./McqQuestion";
import { ShortAnswerQuestion } from "./ShortAnswerQuestion";

type Question = {
  id: string;
  order: number;
  type: "MCQ" | "SHORT_ANSWER";
  promptText: string;
  options: string[] | null;
};

export function TakeTestClient({ testId }: { testId: string }) {
  const router = useRouter();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const startRes = await fetch(`/api/tests/${testId}/start`, { method: "POST" });
      const startData = await startRes.json();
      if (!startRes.ok) {
        if (!cancelled) setError(startData.error ?? "Could not start the test.");
        return;
      }

      const detailRes = await fetch(`/api/tests/${testId}`);
      const detail = await detailRes.json();
      if (!detailRes.ok) {
        if (!cancelled) setError(detail.error ?? "Could not load the test.");
        return;
      }

      if (!cancelled) {
        setAttemptId(startData.attemptId);
        setTimeLimitMinutes(startData.timeLimitMinutes);
        setQuestions(detail.questions);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [testId]);

  const handleSubmit = useCallback(async () => {
    if (!attemptId || !questions || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    setError(null);

    const answers = questions.map((q) =>
      q.type === "MCQ"
        ? { questionId: q.id, selectedOptionIndex: mcqAnswers[q.id] }
        : { questionId: q.id, userAnswerText: textAnswers[q.id] ?? "" },
    );

    try {
      const res = await fetch(`/api/tests/${testId}/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed.");
      router.push(`/tests/${testId}/results/${attemptId}`);
    } catch (err) {
      submittedRef.current = false;
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }, [attemptId, questions, mcqAnswers, textAnswers, testId, router]);

  function handleExit() {
    if (window.confirm("Exit this test? Your answers so far will not be saved.")) {
      router.push("/tests");
    }
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!questions || !attemptId || timeLimitMinutes === null) {
    return <p className="text-gray-500">Loading test...</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Test in progress</h1>
        <div className="flex items-center gap-3">
          <TestTimer timeLimitMinutes={timeLimitMinutes} onExpire={handleSubmit} />
          <button
            type="button"
            onClick={handleExit}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            Exit test
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {questions.map((q, i) =>
          q.type === "MCQ" ? (
            <McqQuestion
              key={q.id}
              index={i}
              prompt={q.promptText}
              options={q.options ?? []}
              selected={mcqAnswers[q.id] ?? null}
              onSelect={(opt) => setMcqAnswers((prev) => ({ ...prev, [q.id]: opt }))}
            />
          ) : (
            <ShortAnswerQuestion
              key={q.id}
              index={i}
              prompt={q.promptText}
              value={textAnswers[q.id] ?? ""}
              onChange={(text) => setTextAnswers((prev) => ({ ...prev, [q.id]: text }))}
            />
          ),
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
      >
        {submitting ? "Submitting..." : "Submit test"}
      </button>
    </div>
  );
}
