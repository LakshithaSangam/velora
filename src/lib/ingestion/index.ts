import type { SourceType } from "@prisma/client";
import type { IngestResult, SourceAdapterInput } from "./types";
import { pdfAdapter } from "./pdf";
import { webArticleAdapter } from "./web-article";
import { pastedTranscriptAdapter } from "./pasted-transcript";

export async function ingestSource(
  type: SourceType,
  input: SourceAdapterInput,
): Promise<IngestResult & { fileKey?: string }> {
  switch (type) {
    case "PDF":
      return pdfAdapter.ingestWithFileKey(input);
    case "WEB_ARTICLE":
      return webArticleAdapter.ingest(input);
    case "PASTED_TRANSCRIPT":
      return pastedTranscriptAdapter.ingest(input);
    case "YOUTUBE":
    case "GENERIC_VIDEO":
      throw new Error(`${type} ingestion is not available yet.`);
    case "MEETING_RECORDING":
      throw new Error("Meeting recording ingestion is not implemented.");
    default: {
      const _exhaustive: never = type;
      throw new Error(`Unknown source type: ${_exhaustive}`);
    }
  }
}
