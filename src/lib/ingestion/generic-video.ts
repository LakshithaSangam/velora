import { parse as parseVtt } from "node-webvtt";
import type { IngestResult, SourceAdapter, SourceAdapterInput } from "./types";

function srtToVtt(srt: string): string {
  const normalized = srt.replace(/\r\n/g, "\n").trim();
  const body = normalized.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
  return `WEBVTT\n\n${body}\n`;
}

export const genericVideoAdapter: SourceAdapter = {
  async ingest(input: SourceAdapterInput): Promise<IngestResult> {
    if (!input.url) throw new Error("Generic video ingestion requires a direct caption file URL.");

    let url: URL;
    try {
      url = new URL(input.url);
    } catch {
      throw new Error("Invalid URL.");
    }
    if (!/\.(vtt|srt)$/i.test(url.pathname)) {
      throw new Error(
        "This source type currently requires a direct link to a .vtt or .srt caption file, not a video page URL.",
      );
    }

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`Failed to fetch the caption file (HTTP ${res.status}).`);
    let content = await res.text();

    const isVtt = content.trim().startsWith("WEBVTT");
    if (!isVtt) content = srtToVtt(content);

    const parsed = parseVtt(content, { strict: false });
    if (!parsed.cues.length) {
      throw new Error("No caption text found in this file.");
    }

    const rawText = parsed.cues
      .map((c) => c.text.replace(/<[^>]+>/g, "").trim())
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    const durationSec = parsed.cues.reduce((max, c) => Math.max(max, c.end), 0);

    return {
      rawText,
      title: url.pathname.split("/").pop()?.replace(/\.(vtt|srt)$/i, "") || "Video captions",
      sourceMeta: {
        durationSec: Math.round(durationSec),
        wordCount: rawText.split(/\s+/).length,
        format: isVtt ? "vtt" : "srt",
      },
    };
  },
};
