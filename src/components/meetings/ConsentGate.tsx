"use client";

import { useState } from "react";

export function ConsentGate({ onConfirm }: { onConfirm: () => void }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="max-w-xl space-y-5 rounded-lg border border-gray-200 p-6 dark:border-gray-800">
      <h2 className="text-lg font-semibold">Before you start</h2>

      <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
        <p>
          This feature listens to the audio of a tab, window, or screen you choose to share, for example a
          Zoom or Google Meet call. It transcribes that audio and uses AI to build live notes. Nothing here
          joins the meeting as a bot or interacts with Zoom or Meet in any way. It simply captures audio your
          own browser is already playing.
        </p>
        <p>
          In many places, recording or transcribing a conversation without telling the other participants is
          illegal, no matter how the recording happens. <strong>You are responsible for letting everyone else
          in the meeting know</strong> that you are using this tool before you start.
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
          I confirm I have told everyone else in this meeting that I am using an AI tool to take notes, and
          they know they may be recorded or transcribed.
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
