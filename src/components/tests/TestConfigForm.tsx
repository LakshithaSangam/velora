"use client";

import { useState } from "react";
import { TestGeneratingLoader } from "./TestGeneratingLoader";
import { useMascotErrorMood, useMascotLoadingMood } from "@/lib/mascot-bus";

export type QuestionStyle = "MCQ" | "SHORT_ANSWER" | "MIXED";

export type TestConfig = {
  requestedQuestionCount: number;
  questionStyle: QuestionStyle;
  repeatPreviousQuestions: boolean;
};

export function TestConfigForm({
  onSubmit,
  loading,
  error,
  showRepeatOption = false,
  submitLabel = "Generate test",
}: {
  onSubmit: (config: TestConfig) => void;
  loading: boolean;
  error: string | null;
  showRepeatOption?: boolean;
  submitLabel?: string;
}) {
  const [count, setCount] = useState(10);
  const [style, setStyle] = useState<QuestionStyle>("MIXED");
  const [repeatPreviousQuestions, setRepeatPreviousQuestions] = useState(false);
  useMascotLoadingMood(loading);
  useMascotErrorMood(error);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ requestedQuestionCount: count, questionStyle: style, repeatPreviousQuestions });
      }}
      className="space-y-4 rounded-lg border border-gray-200 p-5 dark:border-gray-800"
    >
      <div className="space-y-1">
        <label htmlFor="count" className="text-sm font-medium">
          Number of questions
        </label>
        <input
          id="count"
          type="number"
          min={1}
          max={50}
          value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
          className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-transparent"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="style" className="text-sm font-medium">
          Question style
        </label>
        <select
          id="style"
          value={style}
          onChange={(e) => setStyle(e.target.value as QuestionStyle)}
          className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        >
          <option value="MIXED">Mixed (MCQ + short answer)</option>
          <option value="MCQ">Multiple choice only</option>
          <option value="SHORT_ANSWER">Short answer only</option>
        </select>
      </div>

      {showRepeatOption && (
        <div className="space-y-1">
          <label htmlFor="repeat" className="text-sm font-medium">
            Repeat a few old questions?
          </label>
          <select
            id="repeat"
            value={repeatPreviousQuestions ? "yes" : "no"}
            onChange={(e) => setRepeatPreviousQuestions(e.target.value === "yes")}
            className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="no">No — all new questions</option>
            <option value="yes">Yes — mix in a few from before</option>
          </select>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <TestGeneratingLoader />
      ) : (
        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          {submitLabel}
        </button>
      )}
    </form>
  );
}
