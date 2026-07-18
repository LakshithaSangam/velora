"use client";

import { useEffect, useState } from "react";

const ENCOURAGEMENTS = [
  "You've got this!",
  "Keep going, steady pace!",
  "Looking good so far!",
  "Almost through it!",
  "Stay focused, you're doing great!",
] as const;

function getMood(fractionLeft: number): { emoji: string; label: string } {
  if (fractionLeft > 0.5) return { emoji: "🐢", label: "plenty of time" };
  if (fractionLeft > 0.25) return { emoji: "🙂", label: "halfway there" };
  if (fractionLeft > 0.1) return { emoji: "😬", label: "getting close" };
  return { emoji: "😅", label: "running out of time" };
}

export function TestTimer({ timeLimitMinutes, onExpire }: { timeLimitMinutes: number; onExpire: () => void }) {
  const totalSeconds = timeLimitMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [message, setMessage] = useState<string | null>(null);
  const expired = secondsLeft <= 0;

  useEffect(() => {
    if (expired) {
      onExpire();
      return;
    }
    const interval = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired]);

  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(null), 2000);
    return () => clearTimeout(timeout);
  }, [message]);

  const mins = Math.floor(Math.max(0, secondsLeft) / 60);
  const secs = Math.max(0, secondsLeft) % 60;
  const fractionLeft = Math.max(0, secondsLeft) / totalSeconds;
  const low = secondsLeft <= 60;
  const mood = getMood(fractionLeft);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMessage(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)])}
        title="Click for encouragement"
        className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium tabular-nums transition-colors ${
          low
            ? "border-red-300 text-red-600 dark:border-red-800"
            : "border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
        }`}
      >
        <span
          key={mood.emoji}
          role="img"
          aria-label={mood.label}
          className="inline-block animate-[bounce_0.6s_ease-in-out]"
        >
          {mood.emoji}
        </span>
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </button>
      {message && (
        <div className="absolute top-full right-0 mt-1 whitespace-nowrap rounded-md bg-black px-2 py-1 text-xs text-white shadow-lg dark:bg-white dark:text-black">
          {message}
        </div>
      )}
    </div>
  );
}
