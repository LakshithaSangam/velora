import { PDFParse } from "pdf-parse";
import type { IngestResult, SourceAdapter, SourceAdapterInput } from "./types";
import { saveUploadedFile } from "@/lib/storage/files";

const MAX_PDF_BYTES = 32 * 1024 * 1024; // Gemini's direct-attach limit

export const pdfAdapter: SourceAdapter & {
  ingestWithFileKey(input: SourceAdapterInput): Promise<IngestResult & { fileKey: string }>;
} = {
  async ingest(input) {
    const result = await this.ingestWithFileKey(input);
    return result;
  },

  async ingestWithFileKey(input: SourceAdapterInput) {
    if (!input.fileBuffer) throw new Error("PDF ingestion requires a file.");
    if (input.fileBuffer.byteLength > MAX_PDF_BYTES) {
      throw new Error("PDF exceeds the 32MB size limit.");
    }

    const fileKey = await saveUploadedFile(input.fileBuffer, input.fileName ?? "upload.pdf");

    let rawText = "";
    let pageCount: number | undefined;
    // Everything here, constructing the parser, parsing, and cleaning up,
    // must stay inside one try/catch. pdf-parse can fail at any of those
    // three steps (an image-only PDF, an unsupported structure, or even a
    // module-loading error in some runtimes), and none of that should ever
    // surface as a hard failure: Gemini's native PDF reading at generation
    // time still handles it, rawText just stays empty for now.
    try {
      const parser = new PDFParse({ data: input.fileBuffer });
      try {
        const parsed = await parser.getText({ pageJoiner: "\n\n" });
        rawText = parsed.text.trim();
        pageCount = parsed.total;
      } finally {
        await parser.destroy().catch(() => {});
      }
    } catch {
      // See comment above — intentionally left empty.
    }

    const title = input.fileName?.replace(/\.pdf$/i, "") || "Untitled PDF";

    return {
      rawText,
      title,
      fileKey,
      sourceMeta: {
        pageCount,
        wordCount: rawText ? rawText.split(/\s+/).length : 0,
        originalFileName: input.fileName,
      },
    };
  },
};
