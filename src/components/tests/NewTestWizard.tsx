"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TestSourcePicker, type ExistingNotesOption } from "./TestSourcePicker";
import { TestConfigForm, type QuestionStyle } from "./TestConfigForm";

export function NewTestWizard({ existingNotes }: { existingNotes: ExistingNotesOption[] }) {
  const router = useRouter();
  const [notesDocumentId, setNotesDocumentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(config: { requestedQuestionCount: number; questionStyle: QuestionStyle }) {
    if (!notesDocumentId) return;
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

  if (!notesDocumentId) {
    return <TestSourcePicker existingNotes={existingNotes} onNotesReady={setNotesDocumentId} />;
  }

  return <TestConfigForm onSubmit={handleGenerate} loading={loading} error={error} />;
}
