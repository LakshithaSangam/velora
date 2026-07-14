import { YoutubeTranscript } from "youtube-transcript";
import type { IngestResult, SourceAdapter, SourceAdapterInput } from "./types";

export const youtubeAdapter: SourceAdapter = {
  async ingest(input: SourceAdapterInput): Promise<IngestResult> {
    if (!input.url) throw new Error("YouTube ingestion requires a URL.");

    let segments;
    try {
      segments = await YoutubeTranscript.fetchTranscript(input.url);
    } catch {
      throw new Error(
        "Couldn't fetch captions for this YouTube video. It may have captions disabled, be " +
          "region-restricted, or the video ID may be invalid. Try the \"Paste transcript\" option instead " +
          "if you have the transcript available.",
      );
    }

    if (!segments.length) {
      throw new Error("No captions were found for this video.");
    }

    const rawText = segments
      .map((s) => s.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    const durationSec = segments.reduce((max, s) => Math.max(max, s.offset + s.duration), 0);

    return {
      rawText,
      title: `YouTube video (${input.url})`,
      sourceMeta: {
        durationSec: Math.round(durationSec),
        wordCount: rawText.split(/\s+/).length,
        language: segments[0]?.lang ?? null,
      },
    };
  },
};
