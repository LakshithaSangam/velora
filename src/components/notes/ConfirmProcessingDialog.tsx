"use client";

import type { IngestedSource } from "./SourcePicker";
import { useMascotErrorMood, useMascotLoadingMood } from "@/lib/mascot-bus";

export function ConfirmProcessingDialog({
  source,
  loading,
  error,
  onConfirm,
  onCancel,
}: {
  source: IngestedSource;
  loading: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useMascotLoadingMood(loading);
  useMascotErrorMood(error);

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 p-5 dark:border-gray-800">
      <div>
        <h2 className="font-medium">{source.title}</h2>
        <p className="text-sm text-gray-500">{source.type}</p>
      </div>

      <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300">
        {source.rawTextPreview || "(no preview available)"}
        {source.rawTextPreview.length >= 2000 && "…"}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        AI will now read this source and generate structured notes. This sends the content above
        to Gemini. Proceed?
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          {loading ? "Generating notes..." : "Yes, generate notes from this source"}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-900"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
