import { toFile } from "openai";
import { getOpenAI } from "@/lib/ai/openai-client";
import type { IngestResult, SourceAdapterInput } from "./types";
import { saveUploadedFile } from "@/lib/storage/files";

const MAX_MEDIA_BYTES = 25 * 1024 * 1024; // Whisper API's hard file-size limit

export const mediaUploadAdapter = {
  async ingest(input: SourceAdapterInput): Promise<IngestResult & { fileKey: string }> {
    if (!input.fileBuffer) throw new Error("Media upload ingestion requires a file.");
    if (input.fileBuffer.byteLength > MAX_MEDIA_BYTES) {
      throw new Error("Audio/video file exceeds the 25MB size limit.");
    }
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "Audio/video transcription isn't set up yet — add an OPENAI_API_KEY to use this feature.",
      );
    }

    const fileKey = await saveUploadedFile(input.fileBuffer, input.fileName ?? "upload");

    const file = await toFile(input.fileBuffer, input.fileName ?? "upload.mp3");
    const transcription = await getOpenAI().audio.transcriptions.create({
      file,
      model: "whisper-1",
    });

    const rawText = transcription.text.trim();
    const title = input.fileName?.replace(/\.[^.]+$/, "") || "Untitled recording";

    return {
      rawText,
      title,
      fileKey,
      sourceMeta: {
        wordCount: rawText ? rawText.split(/\s+/).length : 0,
        originalFileName: input.fileName,
      },
    };
  },
};
