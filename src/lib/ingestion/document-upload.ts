import mammoth from "mammoth";
import * as XLSX from "xlsx";
import type { IngestResult, SourceAdapterInput } from "./types";
import { saveUploadedFile } from "@/lib/storage/files";

const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;

function extractExcelText(buffer: Buffer): string {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  return workbook.SheetNames.map((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet).trim();
    return `Sheet: ${sheetName}\n${csv}`;
  })
    .filter((section) => section.length > 0)
    .join("\n\n");
}

export const documentUploadAdapter = {
  async ingest(input: SourceAdapterInput): Promise<IngestResult & { fileKey: string }> {
    if (!input.fileBuffer) throw new Error("Document upload ingestion requires a file.");
    if (input.fileBuffer.byteLength > MAX_DOCUMENT_BYTES) {
      throw new Error("File exceeds the 20MB size limit.");
    }

    const fileKey = await saveUploadedFile(input.fileBuffer, input.fileName ?? "upload");
    const isExcel = /\.xlsx$/i.test(input.fileName ?? "");

    let rawText: string;
    if (isExcel) {
      rawText = extractExcelText(input.fileBuffer);
    } else {
      const result = await mammoth.extractRawText({ buffer: input.fileBuffer });
      rawText = result.value.trim();
    }

    const title = input.fileName?.replace(/\.(docx|xlsx)$/i, "") || "Untitled document";

    return {
      rawText,
      title,
      fileKey,
      sourceMeta: {
        wordCount: rawText ? rawText.split(/\s+/).length : 0,
        originalFileName: input.fileName,
        fileType: isExcel ? "xlsx" : "docx",
      },
    };
  },
};
