import type { SourceType } from "@prisma/client";
import type { IngestResult, SourceAdapterInput } from "./types";
import { pdfAdapter } from "./pdf";
import { webArticleAdapter } from "./web-article";
import { pastedTranscriptAdapter } from "./pasted-transcript";
import { youtubeAdapter } from "./youtube";
import { genericVideoAdapter } from "./generic-video";

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
      return youtubeAdapter.ingest(input);
    case "GENERIC_VIDEO":
      return genericVideoAdapter.ingest(input);
    case "MEETING_RECORDING":
      throw new Error("Meeting recording ingestion is not implemented.");
    default: {
      const _exhaustive: never = type;
      throw new Error(`Unknown source type: ${_exhaustive}`);
    }
  }
}
