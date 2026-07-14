"use client";

import { useState } from "react";

export type IngestedSource = {
  id: string;
  type: string;
  title: string;
  status: string;
  rawTextPreview: string;
  metadata: Record<string, unknown>;
};

const TABS = [
  { key: "PDF", label: "PDF upload" },
  { key: "WEB_ARTICLE", label: "Web article URL" },
  { key: "PASTED_TRANSCRIPT", label: "Paste transcript" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function SourcePicker({ onIngested }: { onIngested: (source: IngestedSource) => void }) {
  const [tab, setTab] = useState<TabKey>("PDF");
  const [url, setUrl] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res: Response;
      if (tab === "PDF") {
        if (!file) throw new Error("Choose a PDF file first.");
        const form = new FormData();
        form.set("type", "PDF");
        form.set("file", file);
        res = await fetch("/api/sources", { method: "POST", body: form });
      } else if (tab === "WEB_ARTICLE") {
        if (!url.trim()) throw new Error("Enter a URL first.");
        res = await fetch("/api/sources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "WEB_ARTICLE", url: url.trim() }),
        });
      } else {
        if (!pastedText.trim()) throw new Error("Paste a transcript first.");
        res = await fetch("/api/sources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "PASTED_TRANSCRIPT", pastedText }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to process source.");
      onIngested(data as IngestedSource);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm ${
              tab === t.key
                ? "border-b-2 border-black font-medium dark:border-white"
                : "text-gray-500 hover:text-black dark:hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {tab === "PDF" && (
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm"
          />
        )}
        {tab === "WEB_ARTICLE" && (
          <input
            type="url"
            placeholder="https://example.com/article"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-transparent"
          />
        )}
        {tab === "PASTED_TRANSCRIPT" && (
          <textarea
            placeholder="Paste a transcript or notes you already have access to..."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={8}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-transparent"
          />
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          {loading ? "Processing source..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
