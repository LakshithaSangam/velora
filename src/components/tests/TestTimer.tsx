"use client";

import { useEffect, useState } from "react";

export function TestTimer({ timeLimitMinutes, onExpire }: { timeLimitMinutes: number; onExpire: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(timeLimitMinutes * 60);
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

  const mins = Math.floor(Math.max(0, secondsLeft) / 60);
  const secs = Math.max(0, secondsLeft) % 60;
  const low = secondsLeft <= 60;

  return (
    <div
      className={`rounded-md border px-3 py-1.5 text-sm font-medium tabular-nums ${
        low
          ? "border-red-300 text-red-600 dark:border-red-800"
          : "border-gray-300 dark:border-gray-700"
      }`}
    >
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </div>
  );
}
