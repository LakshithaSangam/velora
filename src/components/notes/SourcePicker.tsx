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
  { key: "VIDEO", label: "Video/Audio" },
  { key: "PDF", label: "PDF upload" },
  { key: "WEB_ARTICLE", label: "Web article URL" },
  { key: "PASTED_TRANSCRIPT", label: "Paste transcript" },
  { key: "DOCUMENT_UPLOAD", label: "Word/Excel file" },
] as const;

export type TabKey = (typeof TABS)[number]["key"];

function FileChooser({
  id,
  accept,
  file,
  onChange,
  label,
}: {
  id: string;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
  label: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-8 text-center hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-900"
    >
      <span className="text-2xl" aria-hidden>
        📁
      </span>
      {file ? (
        <span className="text-sm font-medium">{file.name}</span>
      ) : (
        <span className="text-sm font-medium">{label}</span>
      )}
      <span className="text-xs text-gray-500">
        {file ? "Click to choose a different file" : "Click here to browse the files on your computer"}
      </span>
      <input
        id={id}
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="hidden"
      />
    </label>
  );
}

function detectVideoSourceType(rawUrl: string): "YOUTUBE" | "GENERIC_VIDEO" {
  let host = "";
  let path = "";
  try {
    const parsed = new URL(rawUrl);
    host = parsed.hostname;
    path = parsed.pathname;
  } catch {
    return "GENERIC_VIDEO";
  }
  if (host.includes("youtube.com") || host.includes("youtu.be")) return "YOUTUBE";
  if (/\.(vtt|srt)$/i.test(path)) return "GENERIC_VIDEO";
  throw new Error(
    "Enter a YouTube video URL, or a direct link to a .vtt/.srt caption file for other video sources.",
  );
}

export function SourcePicker({
  onIngested,
  initialTab = "VIDEO",
}: {
  onIngested: (source: IngestedSource) => void;
  initialTab?: TabKey;
}) {
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [videoMode, setVideoMode] = useState<"link" | "file">("link");
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
      } else if (tab === "VIDEO" && videoMode === "file") {
        if (!file) throw new Error("Choose an audio or video file first.");
        const form = new FormData();
        form.set("type", "MEDIA_UPLOAD");
        form.set("file", file);
        res = await fetch("/api/sources", { method: "POST", body: form });
      } else if (tab === "DOCUMENT_UPLOAD") {
        if (!file) throw new Error("Choose a Word or Excel file first.");
        const form = new FormData();
        form.set("type", "DOCUMENT_UPLOAD");
        form.set("file", file);
        res = await fetch("/api/sources", { method: "POST", body: form });
      } else if (tab === "WEB_ARTICLE") {
        if (!url.trim()) throw new Error("Enter a URL first.");
        res = await fetch("/api/sources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "WEB_ARTICLE", url: url.trim() }),
        });
      } else if (tab === "VIDEO" && videoMode === "link") {
        if (!url.trim()) throw new Error("Enter a video URL first.");
        const videoType = detectVideoSourceType(url.trim());
        res = await fetch("/api/sources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: videoType, url: url.trim() }),
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
        {tab === "VIDEO" && (
          <div className="space-y-3">
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={() => setVideoMode("link")}
                className={`rounded-md border px-3 py-1.5 ${
                  videoMode === "link"
                    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                    : "border-gray-300 dark:border-gray-700"
                }`}
              >
                Paste a link
              </button>
              <button
                type="button"
                onClick={() => setVideoMode("file")}
                className={`rounded-md border px-3 py-1.5 ${
                  videoMode === "file"
                    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                    : "border-gray-300 dark:border-gray-700"
                }`}
              >
                Upload a file
              </button>
            </div>

            <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
              ⚠️ Pasting a link only works for videos that already have captions, either the manual kind
              or ones YouTube generated automatically. If a video has no captions, use &quot;Upload a
              file&quot; instead. Just make sure it&apos;s a file you already have on your computer, not
              something downloaded from YouTube.
            </p>

            {videoMode === "link" ? (
              <div className="space-y-1">
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... or a direct .vtt/.srt caption URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-transparent"
                />
                <p className="text-xs text-gray-500">
                  YouTube links use the video&apos;s captions automatically, free, no AI cost until you
                  generate notes. For other platforms, paste a direct link to a .vtt/.srt caption file (or
                  use &quot;Paste transcript&quot; if you have one saved).
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <FileChooser
                  id="media-file-input"
                  accept="audio/*,video/*"
                  file={file}
                  onChange={setFile}
                  label="Choose an audio or video file from your computer"
                />
                <p className="text-xs text-gray-500">
                  mp3, mp4, m4a, wav, ogg, webm, or flac, up to 25MB. Transcribed automatically via
                  Whisper (needs an OPENAI_API_KEY, small optional per-minute cost, separate from notes
                  generation).
                </p>
              </div>
            )}
          </div>
        )}
        {tab === "PDF" && (
          <FileChooser
            id="pdf-file-input"
            accept="application/pdf"
            file={file}
            onChange={setFile}
            label="Choose a PDF from your computer"
          />
        )}
        {tab === "DOCUMENT_UPLOAD" && (
          <div className="space-y-1">
            <FileChooser
              id="document-file-input"
              accept=".docx,.xlsx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              file={file}
              onChange={setFile}
              label="Choose a Word or Excel file from your computer"
            />
            <p className="text-xs text-gray-500">
              .docx (Word) or .xlsx (Excel), up to 20MB. Text is extracted for free, no AI cost until you
              generate notes.
            </p>
          </div>
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
          <div className="space-y-1">
            <textarea
              placeholder="Paste a transcript or notes you already have access to..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              rows={8}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-transparent"
            />
            <p className="text-xs text-gray-500">
              Use this when you already have text somewhere else, a transcript you copied from a
              website, notes from a friend, captions you downloaded manually, etc. Just paste the raw
              text here instead of uploading a file or a link.
            </p>
          </div>
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
