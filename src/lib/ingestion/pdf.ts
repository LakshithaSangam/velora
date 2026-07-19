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
    const parser = new PDFParse({ data: input.fileBuffer });
    try {
      const parsed = await parser.getText({ pageJoiner: "\n\n" });
      rawText = parsed.text.trim();
      pageCount = parsed.total;
    } catch {
      // Image-only / unparsable PDF — Gemini's native reading at generation
      // time will still handle this; rawText just stays empty for now.
    }
    // destroy() can itself throw after a failed parse (its internal state
    // never fully initialized); that must not override the graceful
    // degradation above and surface as a hard failure to the user.
    try {
      await parser.destroy();
    } catch {
      // Cleanup failure after an already-handled parse failure — ignore.
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
