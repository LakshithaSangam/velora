"use client";

import { useState } from "react";
import { SourcePicker, type IngestedSource } from "@/components/notes/SourcePicker";
import { ConfirmProcessingDialog } from "@/components/notes/ConfirmProcessingDialog";

export type ExistingNotesOption = { id: string; title: string };

export function TestSourcePicker({
  existingNotes,
  onNotesReady,
}: {
  existingNotes: ExistingNotesOption[];
  onNotesReady: (notesDocumentId: string) => void;
}) {
  const [mode, setMode] = useState<"existing" | "fresh">(existingNotes.length > 0 ? "existing" : "fresh");
  const [selectedId, setSelectedId] = useState(existingNotes[0]?.id ?? "");
  const [ingestedSource, setIngestedSource] = useState<IngestedSource | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirmFreshSource() {
    if (!ingestedSource) return;
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/notes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: ingestedSource.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Notes generation failed.");
      onNotesReady(data.id as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-4">
      {existingNotes.length > 0 && (
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setMode("existing")}
            className={`px-3 py-2 text-sm ${
              mode === "existing"
                ? "border-b-2 border-black font-medium dark:border-white"
                : "text-gray-500 hover:text-black dark:hover:text-white"
            }`}
          >
            Use existing notes
          </button>
          <button
            type="button"
            onClick={() => setMode("fresh")}
            className={`px-3 py-2 text-sm ${
              mode === "fresh"
                ? "border-b-2 border-black font-medium dark:border-white"
                : "text-gray-500 hover:text-black dark:hover:text-white"
            }`}
          >
            Generate from a new source
          </button>
        </div>
      )}

      {mode === "existing" && (
        <div className="space-y-3">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-transparent"
          >
            {existingNotes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onNotesReady(selectedId)}
            disabled={!selectedId}
            className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Continue
          </button>
        </div>
      )}

      {mode === "fresh" && !ingestedSource && <SourcePicker onIngested={setIngestedSource} />}

      {mode === "fresh" && ingestedSource && (
        <ConfirmProcessingDialog
          source={ingestedSource}
          loading={generating}
          error={error}
          onConfirm={handleConfirmFreshSource}
          onCancel={() => {
            setIngestedSource(null);
            setError(null);
          }}
        />
      )}
    </div>
  );
}
