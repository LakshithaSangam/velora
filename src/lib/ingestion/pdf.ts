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
    // Everything here, loading pdf-parse, constructing the parser, parsing,
    // and cleaning up, must stay inside one try/catch. A static top-level
    // `import` would resolve before this function ever runs, so any
    // module-loading failure there couldn't be caught at all; the dynamic
    // import() below turns that into a rejected promise this try/catch can
    // actually see. pdf-parse can fail at any of these steps (an image-only
    // PDF, an unsupported structure, or a module-loading error in some
    // runtimes), and none of that should surface as a hard failure: Gemini's
    // native PDF reading at generation time still handles it, rawText just
    // stays empty for now.
    try {
      const { PDFParse } = await import("pdf-parse");
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
