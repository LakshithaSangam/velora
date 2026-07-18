"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SourcePicker, type IngestedSource, type TabKey } from "@/components/notes/SourcePicker";
import { ConfirmProcessingDialog } from "@/components/notes/ConfirmProcessingDialog";

const VALID_TABS: TabKey[] = ["VIDEO", "PDF", "WEB_ARTICLE", "PASTED_TRANSCRIPT", "DOCUMENT_UPLOAD"];

export default function NewNotesPage() {
  return (
    <Suspense>
      <NewNotesPageInner />
    </Suspense>
  );
}

function NewNotesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab = VALID_TABS.includes(requestedTab as TabKey) ? (requestedTab as TabKey) : undefined;
  const [source, setSource] = useState<IngestedSource | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!source) return;
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/notes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: source.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Notes generation failed.");
      router.push(`/notes/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setGenerating(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">New notes</h1>

      {!source ? (
        <SourcePicker onIngested={setSource} initialTab={initialTab} />
      ) : (
        <ConfirmProcessingDialog
          source={source}
          loading={generating}
          error={error}
          onConfirm={handleConfirm}
          onCancel={() => {
            setSource(null);
            setError(null);
          }}
        />
      )}
    </div>
  );
}
