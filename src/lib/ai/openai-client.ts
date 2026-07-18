import OpenAI from "openai";

const globalForOpenAI = globalThis as unknown as { openai: OpenAI | undefined };

// Constructed lazily (not at module import time): the OpenAI SDK throws
// immediately in its constructor if OPENAI_API_KEY is unset, and this module
// is imported unconditionally by the ingestion dispatcher even when the
// Whisper upload feature isn't being used — an eager `new OpenAI()` here
// would crash every source type, not just audio/video uploads.
export function getOpenAI(): OpenAI {
  if (!globalForOpenAI.openai) {
    globalForOpenAI.openai = new OpenAI();
  }
  return globalForOpenAI.openai;
}
