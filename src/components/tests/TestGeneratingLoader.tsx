"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  { emoji: "📝", text: "Writing tricky questions..." },
  { emoji: "🎯", text: "Picking good distractors..." },
  { emoji: "🔍", text: "Combing through your notes..." },
  { emoji: "🧠", text: "Thinking of what really matters..." },
  { emoji: "✅", text: "Double-checking the answers..." },
  { emoji: "⏳", text: "Almost ready..." },
] as const;

export function TestGeneratingLoader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const current = MESSAGES[index];

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <span className="animate-bounce text-xl" role="img" aria-label="loading">
        {current.emoji}
      </span>
      <span>{current.text}</span>
    </div>
  );
}
