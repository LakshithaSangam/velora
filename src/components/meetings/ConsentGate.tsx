"use client";

import { useState } from "react";

export function ConsentGate({ onConfirm }: { onConfirm: () => void }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="max-w-xl space-y-5 rounded-lg border border-gray-200 p-6 dark:border-gray-800">
      <h2 className="text-lg font-semibold">Before you start</h2>

      <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
        <p>
          This feature listens to the audio of a tab, window, or screen you choose to share (for example, a
          Zoom or Google Meet call), transcribes it, and uses AI to build live notes. It does not join the
          meeting as a bot or interact with Zoom/Meet in any way — it only captures audio your own browser
          is already playing.
        </p>
        <p>
          Recording or transcribing a conversation without telling the other participants is illegal in many
          places, regardless of how the recording happens. <strong>You are responsible for informing everyone
          else in the meeting</strong> that you're using this tool before you start.
        </p>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          I confirm I have informed all other participants in this meeting that I'm using an AI note-taking
          tool, and they are aware they may be recorded or transcribed.
        </span>
      </label>

      <button
        onClick={onConfirm}
        disabled={!checked}
        className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-gray-200"
      >
        Continue to screen share
      </button>
    </div>
  );
}
