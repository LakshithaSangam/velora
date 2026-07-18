import type { SourceType } from "@prisma/client";
import type { IngestResult, SourceAdapterInput } from "./types";

// Each adapter is imported dynamically (only when actually needed) rather
// than all up front. Otherwise a bundling/runtime problem in any single
// adapter's dependencies (e.g. pdf-parse's pdfjs-dist) breaks every source
// type, not just the one that's broken — this happened in practice.
export async function ingestSource(
  type: SourceType,
  input: SourceAdapterInput,
): Promise<IngestResult & { fileKey?: string }> {
  switch (type) {
    case "PDF": {
      const { pdfAdapter } = await import("./pdf");
      return pdfAdapter.ingestWithFileKey(input);
    }
    case "WEB_ARTICLE": {
      const { webArticleAdapter } = await import("./web-article");
      return webArticleAdapter.ingest(input);
    }
    case "PASTED_TRANSCRIPT": {
      const { pastedTranscriptAdapter } = await import("./pasted-transcript");
      return pastedTranscriptAdapter.ingest(input);
    }
    case "YOUTUBE": {
      const { youtubeAdapter } = await import("./youtube");
      return youtubeAdapter.ingest(input);
    }
    case "GENERIC_VIDEO": {
      const { genericVideoAdapter } = await import("./generic-video");
      return genericVideoAdapter.ingest(input);
    }
    case "MEDIA_UPLOAD": {
      const { mediaUploadAdapter } = await import("./media-upload");
      return mediaUploadAdapter.ingest(input);
    }
    case "DOCUMENT_UPLOAD": {
      const { documentUploadAdapter } = await import("./document-upload");
      return documentUploadAdapter.ingest(input);
    }
    case "MEETING_RECORDING":
      throw new Error("Meeting recording ingestion is not implemented.");
    default: {
      const _exhaustive: never = type;
      throw new Error(`Unknown source type: ${_exhaustive}`);
    }
  }
}
