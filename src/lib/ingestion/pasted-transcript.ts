import type { IngestResult, SourceAdapter, SourceAdapterInput } from "./types";

export const pastedTranscriptAdapter: SourceAdapter = {
  async ingest(input: SourceAdapterInput): Promise<IngestResult> {
    const text = input.pastedText?.replace(/\r\n/g, "\n").trim();
    if (!text) throw new Error("Pasted transcript is empty.");
    if (text.length < 50) throw new Error("Pasted transcript is too short to generate useful notes.");

    const firstLine = text.split("\n")[0]?.slice(0, 80).trim();

    return {
      rawText: text,
      title: firstLine || "Pasted transcript",
      sourceMeta: { wordCount: text.split(/\s+/).length },
    };
  },
};
